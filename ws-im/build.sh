#! /bin/sh
cp $src/scenarios/* .
cp $src/figures/* .
rm sc-user.js sc-test.js solo-tables.js
opt="--loader:.mp3=dataurl"
