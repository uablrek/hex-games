# A library for creating turn-based games on hex-grids

A browser (client/frontend) oriented game library. Supports:

* Draggable map (png or svg)
* Unit-counter generation
* Grid conversion, distance, neighbour, movement functions
* Game sequences
* Text and unit-counter boxes
* Generic server. Stand-alone or in a Docker container

Please read more at [github](
https://github.com/uablrek/hex-games/blob/main/HEXGAMES.md).

## Installation

Download the release asset `hex-games.tgz`, then

```
cd /your/development/dir
npm link konva           # (optional, to use your local konva)
npm install /path/to/hex-games.tgz
```

#### Npm publish

I tried to publish using [this instruction](
https://docs.npmjs.com/creating-and-publishing-scoped-public-packages),
but after creating an account and organization, enabling 2FA, etc. I
still get:

```
npm publish --access public
...or you do not have permission to access it.
```
So, I gave that up.


## A map/grid example

The [grid test](./waterloo/grid/main.js) for the [Waterloo game](
./waterloo/README.md).

If you clone this repository:
```
#apt install esbuild
#export TEMP=/tmp/tmp/$USER    # (this is the default build directory)
export BROWSER=/opt/google/chrome/chrome
git clone --depth 1 https://github.com/uablrek/hex-games.git
./admin.sh build-lib
./admin.sh build waterloo/grid
ls /tmp/tmp/$USER/hex-games
```

There is a dependency to `esbuild`. The example shows how to install
for Ubuntu. The example uses `chrome` since a "snap" installed Firefox
can't read "file://" URLs.

If you NOT clone this repository:
```
export WS=/tmp/tmp/$USER/hex-games
mkdir -p $WS
cd $WS
npm install /path/to/hex-games.tgz
url=https://raw.githubusercontent.com/uablrek/hex-games/refs/heads/main
curl -O $url/waterloo/grid/main.js
curl -O $url/waterloo/grid/package.json
curl -O $url/waterloo/waterloo.png
esbuild --bundle --outfile=bundle.js --loader:.png=dataurl .
cat > index.html <<EOF
<!DOCTYPE html>
<html>
  <style>body, html { margin: 0; padding: 0; }</style>
  <head>
        <title>Waterloo - grid test</title>
        <script defer src="bundle.js"></script>
  </head>
  <body>
        <div id='container'></div>
  </body>
</html>
EOF
```

Now, open `index.html` in your browser