cp $src/scenario/* $__appd
mv rdtr.html index.html
cp $src/figures/rdtr-* $__appd
if test "$__demos" = "yes"; then
	$me rdtr_build_demos --appd=$__appd/demos
	mv -f demos/index.html .
fi
