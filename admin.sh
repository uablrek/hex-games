#! /bin/sh
##
## admin.sh --
##   Admin script for hex-games
##
## Commands;
##

prg=$(basename $0)
dir=$(dirname $0); dir=$(readlink -f $dir)
me=$dir/$prg

die() {
    echo "ERROR: $*" >&2
    rm -rf $tmp
    exit 1
}
help() {
    grep '^##' $0 | cut -c3-
    rm -rf $tmp
    exit 0
}
test -n "$1" || help
echo "$1" | grep -qi "^help\|-h" && help

log() {
	echo "$*" >&2
}
findf() {
	f=$HOME/Downloads/$1
	test -r $f && return 0
	test -n "$ARCHIVE" && f=$ARCHIVE/$1
	test -r $f
}
findar() {
	findf $1.tar.bz2 || findf $1.tar.gz || findf $1.tar.xz || findf $1.zip
}
#   commands [prefix]
#   alias [alias]
#     Used to set bash command completion and command alias;
#       eval $(./admin.sh alias)
cmd_commands() {
	local prefix=$(echo $1 | tr -- - _)
	grep -E "^cmd_$prefix.*\(" $me | sed -E 's,cmd_([^\(]+).*,\1,' \
		| grep -Ev '^(commands|alias)$' | tr -- _ -
}
cmd_alias() {
	local c=$(basename $me .sh)
	test -n "$1" && c=$1
	cat <<EOF
alias $c=$me;
_${c}_completion() {
  $me commands \$2;
};
complete -o bashdefault -o default -C _${c}_completion $c
EOF
}
# Set variables unless already defined
eset() {
	local e k
	for e in $@; do
		k=$(echo $e | cut -d= -f1)
		opts="$opts|$k"
		test -n "$(eval echo \$$k)" || eval $e
		test "$(eval echo \$$k)" = "?" && eval $e
	done
}

##   env
##     Print environment.
cmd_env() {
	test "$envread" = "yes" && return 0
	envread=yes

	eset TEMP=/tmp/tmp/$USER
	tmp=$TEMP/${prg}_$$

	eset \
		HEX_GAMES_WORKSPACE=$TEMP/hex-games \
		GITHUBD=$HOME/go/src/github.com
	WS=$HEX_GAMES_WORKSPACE
	eset \
		ruffle=$GITHUBD/ruffle-rs/ruffle/target/release/ruffle_desktop \
		FLEX=apache-flex-sdk-4.16.1-bin \
		mapgen2_as=$GITHUBD/amitp/mapgen2_as \
		mapgen2=$GITHUBD/redblobgames/mapgen2 \
		__appd=$WS/appd

	if test "$cmd" = "env"; then
		set | grep -E "^($opts)="
		exit 0
	fi
	mkdir -p $WS
	rdir=$PWD
	cd $dir
}
##   flex-unpack
##     Unpack the ActionScript compiler
cmd_flex_unpack() {
	test -d $WS/$FLEX && return 0
	findar $FLEX || die "Not found [$FLEX]"
	tar -C $WS -xf $f
	log "Unpacked to [$WS/$FLEX]"
	findf playerglobal.swc || die "Not found [playerglobal.swc]"
	mkdir -p $WS/$FLEX/27.0
	cp $f $WS/$FLEX/27.0
}
##   red-blob-check
##     Check requirements for red-blob mapgen2 and mapgen2_as
cmd_red_blob_check() {
	local ok=yes
	if test -d $WS/$FLEX; then
		echo "OK: Flex [$WS/$FLEX]"
	else
		if findar $FLEX; then
			echo "OK: flex archive [$f]"
		else
			ok=no
			echo "MISSING: $FLEX"
			echo "Download from https://flex.apache.org/download-binaries.html"
		fi
	fi
	if test -r $mapgen2/package.json; then
		echo "OK: Mapgen2 clone [$mapgen2]"
	else
		ok=no
		echo "MISSING: Mapgen2 clone [$mapgen2]"
	fi
	if test -r $mapgen2_as/Map.as; then
		echo "OK: Mapgen2_as clone [$mapgen2_as]"
	else
		ok=no
		echo "MISSING: Mapgen2_as clone [$mapgen2_as]"
	fi
	if which esbuild > /dev/null; then
		echo "OK: esbuild is in the PATH"
	else
		ok=no
		echo "MISSING: esbuild is NOT in the PATH"
	fi
	if test -n "$BROWSER"; then
		if test -x "$BROWSER"; then
			echo "OK: browser [$BROWSER]"
		else
			ok=no
			echo "MISSING: executable [$BROWSER]"
		fi
	else
		echo 'MISSING: [$BROWSER]'
	fi
	test "$ok" = "yes" || die "Something is missing"
	return 0
}
##   mapgen2-as-build
##     Build the mapgen2 ActionScript version
cmd_mapgen2_as_build() {
	test -d $mapgen2_as || die "mapgen2_as not cloned"
	cmd_flex_unpack
	cd $mapgen2_as
	export PLAYERGLOBAL_HOME=$WS/$FLEX
	$WS/$FLEX/bin/mxmlc -source-path+=third-party/PM_PRNG \
		-source-path+=third-party/as3delaunay/src \
		-source-path+=third-party/as3corelib/src mapgen2.as
}
##   mapgen2-as-run
##     Run the mapgen2 ActionScript version
cmd_mapgen2_as_run() {
	test -x $ruffle || "Not executable [$ruffle]"
	local swf=$mapgen2_as/mapgen2.swf
	test -r $swf || die "Not readable [$swf]"
	$ruffle $swf
}
##   mapgen2-build [--clean] [--open]
##     Build mapgen2
cmd_mapgen2_build() {
	test -d $mapgen2 || die "mapgen2 not cloned"
	# https://github.com/redblobgames/mapgen2/issues/9
	test "$__clean" = "yes" && rm -r $WS/mapgen2
	mkdir -p $WS/mapgen2
	cd $mapgen2
	test -d ./node_modules || npm install
	./build.sh || die "Build failed"
	cp -r map-icons.png embed.html build $WS/mapgen2
	test "$__open" = "yes" || return 0
	test -n "$BROWSER" || die 'Not defined [$BROWSER]'
	test -x "$BROWSER" || die "Not executable [$BROWSER]"
	GTK_MODULES= $BROWSER --new-window file://$WS/mapgen2/embed.html
}
##   release
##     Create a release zip-file
cmd_release() {
	mkdir -p $tmp
	cp $dir/lib/index.html $tmp
	export __open=no
	$me build --appd=$tmp/grid $dir/grid
	$me rdtr-build --appd=$tmp/rdtr
	cd $tmp
	zip -r $TEMP/hex-games.zip .
	echo "Created [$TEMP/hex-games.zip]"
}
##   build [--appd=dir] [--clean] [--open] <dir>
##     Build an example/project.
##     --clean - Delete existing appd. This is default in $TEMP
##     --open - Open in $BROWSER after succesful build
cmd_build() {
	which esbuild > /dev/null || die 'Not in $PATH [esbuild]'
	src $1
	test -r $src/index.html || die "No index.html in [$src]"
	appdir
	cp $src/* $__appd
	cd $__appd
	test -r build.sh && . ./build.sh
	esbuild --bundle --outfile=bundle.js --loader:.svg=dataurl \
		--loader:.png=dataurl --loader:.jpg=dataurl . || die esbuild
	# Remove everything except index.html and bundle.js
	local f
	for f in $(find . -type f); do
		echo $f | grep -qE '^./(.*.html|bundle.js)$' || rm $f
	done
	test "$__open" != "yes" && return 0
	cmd_open "$2"
}
##   open [--appd=dir] [page]
##     Opens a page in $BROWSER. The "page" must be an url relative to
##     --appd. Example: "units.html?scenario=1"
cmd_open() {
	test -n "$BROWSER" || die 'Not set [$BROWSER]'
	cd $__appd || die "Failed [cd $__appd]"
	local page=index.html
	test -n "$1" && page="$1"
	local file=$(echo "$page" | cut -d'?' -f1)
	test -r "./$file" || die "Not readable [$__appd/$file]"
	if which xdotool > /dev/null; then
		# Try to close the old window
		# https://askubuntu.com/questions/616738/how-do-i-close-a-new-firefox-window-from-the-terminal
		# TODO: examine why this works with Firefox, but not with Chrome
		local title=$(grep -F '<title>' ./$file | cut -d'>' -f2 | cut -d'<' -f1)
		local window=$(xdotool search --name "$title")
		test -n "$window" && xdotool key --window $window Ctrl+Shift+w
	fi
	cd $dir
	GTK_MODULES= $BROWSER --new-window "file://$__appd/$page"
}
appdir() {
	echo $__appd | grep -q "^$TEMP" && eset __clean=yes
	test "$__clean" = "yes" && rm -rf $__appd
	mkdir -p $__appd
}
# Check, and set $src and $main
src() {
	test -n "$1" || die "Parameter missing"
	cd $rdir
	test -d "$1" || die "Not a directory [$1]"
	src=$(readlink -f "$1")
	test -r $src/package.json || die "No package.json in [$1]"
	main=$(cat $src/package.json | jq -r .main)
	test -r $src/$main || die "Missing [$main]"
}
##   rdtr-build [--appd=dir] [--clean] [--open] page
##     Build the "Rise and Decline of the Third Reich" (rdtr) project
cmd_rdtr_build() {
	src=$dir/rdtr
	appdir
	cp $src/*.png $src/*.html $src/*.js $src/*.json $__appd
	cd $__appd
	local sub
	for sub in map-demo units-demo drag-demo deployment-demo restore-demo\
		rdtr-game; do
		esbuild --bundle --outfile=$sub-bundle.js --loader:.svg=dataurl \
			--minify $sub.js  || die esbuild
		rm $sub.js
	done
	rm rdtr.js test-rdtr.js units.js *.json
	test "$__open" != "yes" && return 0
	cmd_open "$1"
}

##
# Get the command
cmd=$(echo $1 | tr -- - _)
shift
grep -q "^cmd_$cmd()" $0 $hook || die "Invalid command [$cmd]"

while echo "$1" | grep -q '^--'; do
	if echo $1 | grep -q =; then
		o=$(echo "$1" | cut -d= -f1 | sed -e 's,-,_,g')
		v=$(echo "$1" | cut -d= -f2-)
		eval "$o=\"$v\""
	else
		if test "$1" = "--"; then
			shift
			break
		fi
		o=$(echo "$1" | sed -e 's,-,_,g')
		eval "$o=yes"
	fi
	shift
done
unset o v

# Execute command
trap "die Interrupted" INT TERM
cmd_env
cmd_$cmd "$@"
status=$?
rm -rf $tmp
exit $status
