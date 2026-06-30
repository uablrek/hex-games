cp $src/../map.js .
echo "[]" > map-data.json
test -r $HOME/map-data.json && cp $HOME/map-data.json .
