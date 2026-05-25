npm link --silent express express-ws
mkdir html
test -n "$APPD" || APPD=../appd
cp $APPD/* html
