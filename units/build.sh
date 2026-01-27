#! /bin/sh
cp $dir/grid/hex-grid.js $__appd
if test "$__images" != "yes"; then
	mv -f $__appd/unit-images-empty.js $__appd/unit-images.js
else
	rm -f $__appd/unit-images-empty.js
fi
