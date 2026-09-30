#! /bin/sh
cp $src/map-maker/example-map.svg $src/map-maker/map-data.json $__appd
cp $src/combat/crt.svg $__appd
test -r $HOME/the-hill.json && cp $HOME/the-hill.json $__appd

