#! /bin/sh
##
## lg.sh --
##    Help script for LGeneral
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
	local d
	for d in $(echo $FSEARCH_PATH | tr : ' '); do
		f=$d/$1
		test -r $f && return 0
	done
	unset f
	return 1
}
findar() {
	findf $1.tar.bz2 || findf $1.tar.gz || findf $1.tar.xz || findf $1.tgz || findf $1.zip
}
#   commands [prefix]
#   alias [alias]
#     Used to set bash command completion and command alias;
#       eval $(./lg.sh alias)
cmd_commands() {
	grep -E "^cmd_$1.*\(" $me | sed -E 's,cmd_([^\(]+).*,\1,' \
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
	eset ARCHIVE=$HOME/archive
	eset FSEARCH_PATH=$HOME/Downloads:$ARCHIVE
	eset \
		WS='' \
		LGENERAL_WS=$TEMP/lgeneral \
		ver=lgeneral-1.4.4 \
		sdl12=sdl12-compat-1.2.70 \
		data=pg-data
	WS=$LGENERAL_WS
	eset sysd=$WS/sys
	eset idir=$sysd/usr/local

	tmp=$WS/${prg}_$$
	if test "$cmd" = "env"; then
		set | grep -E "^($opts)="
		exit 0
	fi
	test -n "$long_opts" && export $long_opts
	mkdir -p $WS
	odir=$PWD
	cd $dir
}
##   clean
##     Clean $WS
cmd_clean() {
	rm -rf $WS
}
##   versions
##     Print versions and archives
cmd_versions() {
	local v
	for v in $ver $data $sdl12; do
		if findar $v; then
			echo "$v - $f"
		else
			echo "$v - Archive not found!"
		fi
	done
}
##   emit-terrain
##     Emit js-code for terrain data
cmd_emit_terrain() {
	cmd_data
	local t
	local ex='crosshair|damage_bars|danger|explosion|flags|fog|grid|select_frame|units'
	mkdir -p $tmp
	for t in $(ls $WS/data | sed -e 's,.png,,'); do
		echo $t | grep -q -E "$ex" && continue
		echo $t >> $tmp/t
	done
	for t in $(cat $tmp/t); do
		echo "import ${t}_data from './$t.png'"
	done
	echo "export const tdata = new Map(["
	for t in $(cat $tmp/t); do
		echo "\t[\"$t\", {data: ${t}_data}],"
	done
	echo "])"
}
##   sdl12
##     Unpack and build SDL12-compat
cmd_sdl12() {
	local d=$WS/$sdl12
	test "$__force" = "yes" && rm -rf $d $WS/sys
	if test -d $d; then
		log "SDL12 already built at [$d]"
		return 0
	fi
	findar $sdl12 || die "Archive not found [$sdl12]"
	tar -C $WS -xf $f
	cd $d
	cmake -Bbuild -DCMAKE_BUILD_TYPE=Release . || die "sdl12 cmake"
	cmake --build build || die "sdl12 cmake build"
	cd build
	make DESTDIR=$WS/sys install || die "sdl12 make install"
	sed -i -e "s,/usr/local,$idir," $idir/bin/sdl-config
}
##   unpack
##     Unpack LGeneral to $WS
cmd_unpack() {
	local d=$WS/$ver
	test "$__force" = "yes" && rm -rf $d
	if test -d $d; then
		log "Already unpacked at [$d]"
		return 0
	fi
	findar $ver || die "Archive not found [$ver]"
	tar -C $WS -xf $f
}
##   build
##     Build LGeneral
cmd_build() {
	cmd_sdl12
	cmd_unpack
	if test -x $idir/bin/lgeneral; then
		log "LGeneral already built"
		return 0
	fi
	local d=$WS/$ver
	cd $d
	./configure --prefix=$idir --disable-sound --with-sdl-prefix=$idir \
		|| die configure
	make -j$(nproc) || die make
	make install || die "make install"
	findar pg-data || die "Not found [pg-data]"
	mkdir -p $tmp
	tar -C $tmp -xf $f
	local dst=$idir/share/lgeneral
	$idir/bin/lgc-pg -s $tmp/pg-data -d $dst || die lgc-pg
}
##   data [--patch=] [--apply]
##     Generate data for image, map, etc. to $WS/data.
##     --patch creates a patch, --apply applies it
cmd_data() {
	local dst=$WS/data
	mkdir -p $dst
	cd $idir/share/lgeneral/gfx
	mogrify -format png -transparent black terrain/pg/*.bmp
	mv terrain/pg/*.png $dst
	mogrify -format png -transparent black units/pg.bmp
	mv units/pg.png $dst/units.png
	mogrify -format png -transparent black flags/pg.bmp
	mv flags/pg.png $dst/flags.png
	json_data
}
json_data() {
	local dst=$WS/data
	mkdir -p $dst || die mkdir
	if test -n "$__patch"; then
		test -n "$__apply" && die "Not both patch and apply!"
		test "$__patch" = "yes" && __patch=$dir/json.patch
		if ! test -d $WS/lgeneral-orig; then
			findar $ver || dir "Not found [$ver]"
			mkdir -p $WS/lgeneral-orig
			tar -C $WS/lgeneral-orig --strip-components=1 -xf $f
		fi
		cd $WS
		diff -ur -x '*.o' -x Makefile -x lgc-pg -x .deps -x shptool \
			lgeneral-orig/lgc-pg $ver/lgc-pg > $__patch
	fi
	findar pg-data || die "Not found [pg-data]"
	mkdir -p $tmp $tmp/nations $tmp/gfx/flags $tmp/units $tmp/gfx/units \
		$tmp/sounds/pg $tmp/maps $tmp/gfx/terrain/pg $tmp/scenarios/pg
	tar -C $tmp -xf $f
	if test -n "$__apply"; then
		cd $WS/$ver
		patch -p1 < $dir/json.patch
	fi
	cd $WS/$ver/lgc-pg
	make || die "make lgc-pg"
	./lgc-pg -s $tmp/pg-data -d $tmp || die lgc-pg
	mkdir -p $dst
	cp $(find $tmp -name '*.json') $dst
}
##   cpdata <dir>
##     Copy game data
cmd_cpdata() {
	test -n "$1" || die "No dir"
	cd $odir
	local dst=$(readlink -f $1)
	test -d "$dst" || die "Not a directory [$dst]"
	local dd=$WS/data
	test -d $dd || cmd_data
	cp $dd/* $dst
}
##   run
##     Run LGeneral
cmd_run() {
	$idir/bin/lgeneral &
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
	long_opts="$long_opts $o"
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
