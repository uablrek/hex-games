# Hex-games

Experiments with turn-based games on a hex grid.

I have wanted to write a hex based, turn-based game for a long time. I
have actually started (and abandoned) such projects at least 3
times. A problem has been what language and graphic environment to
use. This take I use HTML5/canvas, SVG and JavaScript.

Much inspiration (and code) is taken from [Red Blob Games](
https://www.redblobgames.com/). An excellent site! [Konva](
https://konvajs.org/docs/index.html) is used for most canvas
manipulations, and [Inkscape](https://inkscape.org/) for SVG drawing.

To try the grid example, Unzip the release and open `grid/index.html`
in your browser. No dependencies needed!

### Dependencies

* [esbuild](https://esbuild.github.io/) - Must be in your $PATH
* [Konva](https://konvajs.org/docs/index.html) - Scripts must be able to impot
* [Inkscape](https://inkscape.org/) - for SVG drawing

## admin.sh

Most things can be done with the [admin.sh](admin.sh) script.
```
eval $(./admin.sh alias) # Define "admin" alias with command completion
admin                    # Help printout
admin env                # Print working environment
admin <tab><tab>         # suggest available commands
```

Set environment variables if necessary. Example:
```
export GITHUBD=$HOME/go/src/github.com
export BROWSER=/usr/bin/firefox
```

## Manually crafted maps

These are usually the best. Scalable Vector Graphics (SVG) is used
and edited with [Inkscape](https://inkscape.org/).

### Hex grid

The hex grid *can* be created using scripts, but IMO it is better to use an SVG
[pattern](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Patterns).

<p float="left">
  <img src="figures/hexp.svg" width="30%" />
  <img src="figures/hexf.svg" width="30%" />
</p>

These images were created with:
```
eval $(./hex.py emit-completion)
hex emit-grid --size 40 --rect 480x240  > figures/hexp.svg
hex emit-grid --size 40 --rect 480x240 --flattop > figures/hexf.svg
```

An svg-pattern-grid can be created in this way and be imported as a
"layer" in `Inkscape`.


## Red Blob Games

[Red Blob Games](https://www.redblobgames.com/)
([github](https://github.com/redblobgames)) is truly amazing. It seems
to cover everything! For instance [hex-grids](
https://www.redblobgames.com/grids/hexagons/). Older examples are
written in [ActionScript](https://en.wikipedia.org/wiki/ActionScript)
(flash), but newer are in JavaScript and [HTML5 canvas](
https://en.wikipedia.org/wiki/Canvas_element).

### Mapgen2 - ActionScript version

Here is a [demo of generated hex-maps](
https://theory.stanford.edu/~amitp/game-programming/polygon-map-generation/demo.html) ([github](https://github.com/amitp/mapgen2)). Clone it and update
submodules with `git submodule update --init`.

To build you need the [Flex SDK](
https://flex.apache.org/download-binaries.html). That in turn needs
`playerglobal.swc` which is hard to find since Adobe has cut support
(and downloading). After some google'ing I found it [here](
https://github.com/nexussays/playerglobal/blob/master/11.5/playerglobal.swc).
[Ruffle](https://github.com/ruffle-rs/ruffle) is used for flash emulation.
This project is maintained and built fine on my Ubuntu 24.04 LTS. Then run
`mapgen2.swf` with ruffle.

If you have cloned to `$GITHUBD` and downloaded required files, do:
```
admin red-blob-check
admin mapgen2-as-build
admin mapgen2-as-run
```

### Mapgen2

The new version of [mapgen2](https://www.redblobgames.com/maps/mapgen2/)
([github](https://github.com/redblobgames/mapgen2/))
uses JavaScript and HTML5.

To build and run, make sure [esbuild](https://esbuild.github.io/) is
in the path, and call `./build.sh` in the mapgen2 directory. Then open
`embed.html` in your browser. Or do:

```
export BROWSER=/usr/bin/firefox
admin mapgen2-build --open
```

## Non-regular Hexagons

Initially I wanted to use non-regular Hexagons, but it becomes messy
so I have abandoned this for now. A single *size* parameter is not
sufficient. Instead the hexagons may be defined by *(sx, sy, h)*:

<img src="figures/hex.svg" width="50%" />
