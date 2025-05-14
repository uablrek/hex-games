#! /bin/sh
##
## admin.sh --
##   Admin script for hex-games
##
## Commands;
##

prg=$(basename $0)
dir=$(dirname $0); dir=$(readlink -f $dir)
tmp=/tmp/tmp/$USER/tmp/${prg}_$$

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

##   env [--wsclean]
##     Print environment.
cmd_env() {
	test "$envread" = "yes" && return 0
	envread=yes

	eset \
		HEX_GAMES_WORKSPACE=/tmp/tmp/$USER/hex-games \
		GITHUBD=$HOME/go/src/github.com
	WS=$HEX_GAMES_WORKSPACE
	eset \
		ruffle=$GITHUBD/ruffle-rs/ruffle/target/release/ruffle_desktop \
		FLEX=apache-flex-sdk-4.16.1-bin \
		mapgen2_as=$GITHUBD/amitp/mapgen2_as \
		mapgen2=$GITHUBD/redblobgames/mapgen2 \
		__project=$dir/grid0 \
		__browser=/opt/google/chrome/chrome

	if test "$cmd" = "env"; then
		set | grep -E "^($opts)="
		test "$__wsclean" = "yes" && rm -r $WS
		exit 0
	fi
	mkdir -p $WS
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

##   flex_unpack
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
##   mapgen2_as_build
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
##   mapgen2_as_run
##     Run the mapgen2 ActionScript version
cmd_mapgen2_as_run() {
	test -x $ruffle || "Not executable [$ruffle]"
	local swf=$mapgen2_as/mapgen2.swf
	test -r $swf || die "Not readable [$swf]"
	$ruffle $swf
}
##   mapgen2_build [--open]
##     Build mapgen2
cmd_mapgen2_build() {
	test -d $mapgen2 || die "mapgen2 not cloned"
	# https://github.com/redblobgames/mapgen2/issues/9
	mkdir -p $WS/mapgen2
	cp $mapgen2/map-icons.png $WS/mapgen2
	__project=$mapgen2
	__out=$WS/mapgen2/build/_bundle.js
	cmd_build $@
}
##   build [--project=dir] [--out=] [--open] [-- esbuild-options...]

##     Build a bundle. The path to the --project dir must be absolute
##     and the dir must contain a "package.json" and a "embed.html"
##     file. Output defaults to
##     $HEX_GAMES_WORKSPACE/<project-name>/<project-name>.js
cmd_build() {
	which esbuild > /dev/null || die "Not in path [esbuild]"
	test -r $__project/package.json || \
		die "Not readable [$__project/package.json]"
	local html=$__project/embed.html
	test -r $html || die "Not readable [$html]"
	local name=$(basename $__project)
	test -n "$__out" || __out=$WS/$name/$name.js
	local outd=$(dirname $__out)
	mkdir -p $outd || die "Failed mkdir [$outd]"
	cp $html $outd
	cd $__project
	local bundle=bundle.js
	test -r $bundle || bundle=$name.js
	test -r $bundle || die "Not readable [$bundle]"
	esbuild --bundle $name.js --loader:.png=dataurl \
		--outfile=$__out $@ || die esbuild
	test "$__open" = "yes" && cmd_open
}
##   open [--browser=path] [--project=dir]
##     Open a project in the browser. The --project dir must contain a
##     "embed.html" file
cmd_open() {
	local name=$(basename $__project)
	local file=$WS/$name/embed.html
	test -r $file || die "Not readable [$file]"
	GTK_MODULES= $__browser --new-window file://$file
}

##
# Get the command
cmd=$1
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
