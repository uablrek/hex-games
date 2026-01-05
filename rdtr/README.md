## Rise and Decline of the Third Reich

An old dream of mine is to write a computer version of the
[Rise and Decline of the Third Reich](
https://en.wikipedia.org/wiki/Rise_and_Decline_of_the_Third_Reich)
board game (RDTR from now on), which I played a lot in the late 1970's.
There are actually several computer versions already
written, but I want to try it myself with JavaScript and HTML5/canvas.

The [rules](http://www.wargameacademy.org/3R4/3R4-rulebook-070908.pdf)
are *horribly* complex (55 pages!), so just make a program enforce
them would be a daunting task. I will start with basic mecanics like
draw the map, and moving counters (units) on it.

There are many resources at [BGG](
https://boardgamegeek.com/boardgame/1563/rise-and-decline-of-the-third-reich/files?pageid=1).
I use the *excellent* works of [John_AHfan](
https://boardgamegeek.com/profile/John_AHfan). Here are his conditions:

> The creator of this file makes no copyright claim on this work nor
> should anyone who possesses a copy of it, or derives/creates
> anything from it. Include this statement with the file and anything
> derived from it. This work should not be used for commercial
> purposes, except to charge reasonable fees for services such as
> printing.

I will use JavaScript and the [Konva](https://konvajs.org/docs/index.html)
framework. Bundles are created with [esbuild](https://esbuild.github.io/).

As you might have noticed, this is a Work In Progress (WIP). I will
document the development process for myself, and others. I will
include dead-ends, abandoned ideas, new ideas, mess-up's, etc. I am
new at JavaScript, so there may be many of them. I will create
pre-relases on [github](https://github.com/uablrek/hex-games/releases)
when I feel I have some significant to present. To test a release:

1. Download `hex-games.zip` release Asset
2. Unpack it locally (you *must* unpack on Windows. Not just dive into the zip archive)
3. Open `rdtr/index.html` in your browser

**TODO:** Create some kind of code structure. Since I haven't worked
  with a larger JavaScript (or associates) project, I don't know the
  best practices.


## The map

I *really want* vector graphics, and in HTML5 that means [SVG](
https://en.wikipedia.org/wiki/SVG). There is no SVG-map on BGG, but
there are [PDF-maps](
https://boardgamegeek.com/filepage/243176/scalable-pdf-3rd-reich-map-vector-graphics).

[Inkscape](https://inkscape.org/) can import PDF, but crashes when
importing the map. There are also several [online tools](
https://www.google.com/search?q=convert+pdf+to+svg), but the ones I
have tries produces *absolutely huge* SVG-files with every single item
defined as a shape (including individual characters).

**Bad Idea:** An SVG image converted from a very-complex PDF is
unusable. None of the good stuff in SVG is available.

So, fallback to PNG. I still use the PDF-map, import it to
[Gimp](https://www.gimp.org/), resize it to 3000x2050, and export as
PNG ([map](./rdtr-map.png)).

To investigate the hex-grid I use my [hex.py](../hex.py) script to
generate a grid. The both the map and grid is then imported to
[Inkscape](https://inkscape.org/) and aligned:

1. Create grid; `hex emit-grid ...`
2. Open the grid `inkscape rdtr-grid.svg`
3. Import "rdtr-map.png" in incscape
4. Mode the grid rect on top
5. Align the grid with the map-hexes
6. Adjust the grid parameters, and repeat

I got an almost perfect fit with:
```
eval $(./hex.py emit-completion)
hex emit-grid --size 58.7 --scale 0.988 --rect 3000x2050 > rdtr-grid.svg
```

This helps when we convert a mouse-position on the map to a hex
coordinate. If you haven't already, try the `map-demo` in a
pre-release.

### Coordinates

Internally in code I use [Offset coordinates](
https://www.redblobgames.com/grids/hexagons/#coordinates-offset) since
it's simplest. RDTR uses a variation of [Axial coodinates](
https://www.redblobgames.com/grids/hexagons/#coordinates-axial), where
the row specifies with letters `A-Z,AA-NN`. These coordinates are used
on interactions with users.


## Counters

I use the term `unit` often since "counter" has a different meaning in
code, and would cause confusion.

Again, I want vector graphics, but PNG is fine for units.

**Idea:** Write a program to generate an SVG-image of a unit given
  parametes like: `--type=inf --stat=3-3 label="22" --color=black`

Same as for the map, I convert the counter [PDF-sheet](
https://boardgamegeek.com/filepage/246780/third-reich-counters-pdf-for-scaling)
to (many) PNG files using [Gimp](https://www.gimp.org/). The
individual counter images are cut out from the sheet with Konva
`clone/crop`.

The counter images must be included in JavaScript objects that a
program can handle.

```javascript
const units = [
        {sheet:fr, pos:{x:0,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"Alp"},
        {sheet:fr, pos:{x:1,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"Col"},
        {sheet:fr, pos:{x:2,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"6"},
        {sheet:fr, pos:{x:3,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"7"},
// ...
        {sheet:germany, pos:{x:8,y:5}, type:"ab", nat:"ge"},
        {sheet:germany, pos:{x:8,y:5}, type:"ab", nat:"ge"},
];
```
New fields, like "img" and "hex" (on map), are added later.

The index in the `units` array is the identifier of the unit. The unit
image has the unique id "rdtru#", where `#` is the index. This makes
it possible to find the unit object from the unit image, for instance
in drag/click event callbacks.

Users do however normally not know the index of a counter, so some
form of human readable form is needed, like `fr,inf,2-3,Alp` or
`uk,nav,9` or `su,air,5-4`. Here are the nation and type codes:

```
	fr: France                     inf: Infantery
	us: USA                        pz:  Panzer
	it: Italy                      air: Air
	ge: Germany                    nav: Navy
	uk: UK                         res: Reserve
	su: USSR                       par: Paratrooper
	tu: Turkey                     ab:  Air base
	sp: Spain                      mec: Mechanized
	nu: Neutrals (incl white bh)   bh:  Bridge head
	bu: Bulgaria                   esc: Escort (white navy)
	ru: Rumania                    bmb: Bomber
	hu: Hungary                    sub: Submarine
	fi: Finland                    int: Interceptor
	iq: Iraq
```