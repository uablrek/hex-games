#! /bin/sh
cp $dir/map-maker/example-map.svg $dir/map-maker/map-data.json $__appd
cp $dir/combat/crt.svg $__appd
test -r $HOME/the-hill.json && cp $HOME/the-hill.json $__appd

