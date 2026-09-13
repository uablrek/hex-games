# LGeneral

LGeneral is a remake of the DOS game [Panzer General](
https://en.wikipedia.org/wiki/Panzer_General). It is a part of
[lgames](https://lgames.sourceforge.io/). This is an attempt to make a
browser version. It is not just compiling the original source, e.g. with
[emscripten](https://emscripten.org/docs/compiling/WebAssembly.html),
to WebAssembly, which I am sure has been done already. The idea is to
rewrite the UI with JavaScript/Konva, and compile non-UI code,
e.g. the AI, to WebAssembly.

Work in Progress (WIP). This is a rather ambitious project, and I
think it will take a long time to finish, if ever.

I will (as usual) start with the fun part: the graphics. The maps in
LGeneral (and Panzer General) are built with hex tiles.

<img src="town.png" width="30%" />

This is different from the usual way in the [hex-games](../README.md)
project, but it has many advantages, like to allow map definitions in
a simple text file. This project can be seen as a Proof of Concept
(PoC) that the `hex-games` lib can be used for tile based maps.

## The help script

Most of things are done using the [lg.sh](./lg,sh) script. It also
serves as documentation.

```
# prerequisite: hex-games/Envsettings has been sourced 
. ./Envsettings       # define some aliases and environment variables
lg                    # print help text
lg env                # print the environment
```

## Original package

Source can be downloaded from the [sourceforge code page](
https://sourceforge.net/p/lgeneral/code/HEAD/tree/), or from the
[LGeneral web page](https://lgames.sourceforge.io/LGeneral/).  It is
assumed that the source and the (required) data pack is downloaded
from the LGeneral web page. When archives are downloaded, you can
build and run with:

```
lg versions
lg build
ls $idir        # list the installation directory
lg run
```
SDK1 is needed, so [sdl12-compat](
https://github.com/libsdl-org/sdl12-compat) is used.

Prerequisite: SDL2-devel must be installed locally.

## Data

The original build is required to extract data (images, sound, etc.). After
a succeful build the data is in:
```
lg build
ls $idir/share/lgeneral/
```

This projects uses different formats, like [png](
https://en.wikipedia.org/wiki/PNG) for images, and [json](
https://en.wikipedia.org/wiki/JSON) for game data.

```
lg data        # applies a patch to lgc-pg and build data
ls $WS/data
```

### Images

Images are in [bmp](https://en.wikipedia.org/wiki/BMP_file_format)
format, with background as black. We want to convert them to
[png](https://en.wikipedia.org/wiki/PNG) with transparent background.
This is done with the [ImageMagick mogrify](
https://imagemagick.org/mogrify/#gsc.tab=0) command
```
# Example
cd $idir/share/lgeneral/gfx/
mogrify -format png -transparent black terrain/pg/mountain_rain.bmp
eog terrain/pg/mountain_rain.png
```

### Game data

Game data, like maps, scenarios, campaigns, are stored in a
proprietary text format. In JavaScript we want [json](
https://en.wikipedia.org/wiki/JSON). The `lgc-pg` program is modified
to emit json. This approach is simpler than to reverse-engineer the
proprietary format and parse the text files.

