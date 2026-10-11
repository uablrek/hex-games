rs=$dir/rdtr
cp $rs/map.js $rs/units.js $rs/scenario/scenario-1939.json .
cp $rs/figures/rdtr-map.png $rs/rdtr-map.json .
echo "[]" > rdtr.json
test -r $HOME/Downloads/rdtr.json && cp $HOME/Downloads/rdtr.json .
