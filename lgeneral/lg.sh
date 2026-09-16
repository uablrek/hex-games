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
	rm -f /tmp/units.js /tmp/*.json
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
	local t
	local ex='crosshair|damage_bars|danger|explosion|flags|fog|grid|select_frame|units'
	mkdir -p $tmp
	test -d $WS/data || die "Data not generated"
	cd $WS/data
	for t in $(ls *.png | sed -e 's,.png,,'); do
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
##   emit-map
##     Emit js-code for map data
cmd_emit_map() {
	local sdir=$idir/share/lgeneral/scenarios/pg
	test -d $sdir || die "Not a directory [$sdir]"
	cd $sdir
	local map sc i
	for i in $(seq 1 38); do
		map=$(printf "map%02d" $i)
		sc=$(grep $map * | cut -d: -f1)
		echo "\t$map: {data: $map, name: \"$sc\"},"
	done
}
##   emit-scenario
##     Emit js-code for scenario data
cmd_emit_scenario() {
	local sdir=$idir/share/lgeneral/scenarios/pg
	test -d $sdir || die "Not a directory [$sdir]"
	cd $sdir
	local sc dn
	for sc in *; do
		dn=$(echo $sc | tr 'A-Z-' 'a-z_')
		echo "import $dn from './$dn.json'"
	done
	for sc in *; do
		dn=$(echo $sc | tr 'A-Z-' 'a-z_')
		echo "\t['$sc', {data: $dn}],"
	done
}
##   emit-scenario-list [--html]
##     Emil a scenario list in markdown or html
cmd_emit_scenario_list() {
	local sdir=$idir/share/lgeneral/scenarios/pg
	test -d $sdir || die "Not a directory [$sdir]"
	cd $sdir
	local map sc i
	for i in $(seq 1 38); do
		map=$(printf "map%02d" $i)
		sc=$(grep $map * | cut -d: -f1)
		test "$sc" = "Sevastapol" && sc="Sevastopol"
		if test "$__html" = "yes"; then
			echo "<li><a href=\"scenario.html?scenario=$sc\">$sc ($map)</a></li>"
		else
			echo "* [$sc](index.html?scenario=$sc) ($map)"
		fi
	done
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
##   data [--patch=] [--create]
##     Generate data for image, map, etc. to $WS/data.
##     Apply --patch, or use --create to create a new
cmd_data() {
	local dst=$WS/data
	mkdir -p $dst
	# convert images with https://imagemagick.org/
	# Black, and the "marker" pixels in units, becomes transparent.
	cd $idir/share/lgeneral/gfx
	mogrify -format png -transparent black terrain/pg/*.bmp
	mv terrain/pg/*.png $dst
	mogrify -format png -transparent black units/pg.bmp
	mv units/pg.png $dst/units.png
	convert $dst/units.png -flop $dst/unitsL.png
	mogrify -transparent '#00c2ff' $dst/units.png $dst/unitsL.png
	mogrify -format png -transparent black flags/pg.bmp
	mv flags/pg.png $dst/flags.png
	# handle patch
	eset __patch=$dir/json.patch
	if test "$__create" = "yes"; then
		rm -f $__patch
		if ! test -d $WS/lgeneral-orig; then
			findar $ver || dir "Not found [$ver]"
			mkdir -p $WS/lgeneral-orig
			tar -C $WS/lgeneral-orig --strip-components=1 -xf $f
		fi
		cd $WS
		diff -ur -x '*.o' -x Makefile -x lgeneral -x .deps -x .dirstamp \
			lgeneral-orig/src $ver/src > $__patch
		diff -ur -x '*.o' -x Makefile -x lgc-pg -x .deps -x shptool \
			lgeneral-orig/lgc-pg $ver/lgc-pg >> $__patch
	else
		cd $WS/$ver
		if grep -q "/tmp/icons.js" ./src/unit_lib.c; then
			log "Already patched"
		else
			patch -p1 < $__patch
		fi
	fi
	# generate json data from LGeneral files
	local parse=$dir/parser.py
	local sd=$idir/share/lgeneral
	$parse $sd/units/pg.udb | jq .unit_lib > $dst/unit-types.json
	for f in $sd/maps/pg/*; do
		n=$(basename $f)
		$parse $f > $dst/$n.json
	done
	for f in $sd/scenarios/pg/*; do
		n=$(basename $f | tr 'A-Z-' 'a-z_')
		$parse $f > $dst/$n.json
	done
	
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
##   rebuild
##     Clean and rebuild everything
cmd_rebuild() {
	$me clean
	$me build
	$me data
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
