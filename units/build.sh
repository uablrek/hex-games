#! /bin/sh
eset __images=yes
if test "$__images" != "yes"; then
	mv -f $__appd/unit-images-empty.js $__appd/unit-images.js
else
	rm -f $__appd/unit-images-empty.js
fi
