# Waterloo - Basic

**[Work in Progress]** Combat, PvP (server) and reinforcements are
not yet implemented. Map and movement works

A browser version of the [Napoleon at Waterloo game](
https://en.wikipedia.org/wiki/Napoleon_at_Waterloo_(board_wargame))
(NaW). No installation needed, just unpack the "waterloo.zip" asset
and open `index.html` in your browser.

The game is built with the work of [Christian Holm Christensen](
https://boardgamegeek.com/profile/cholmcc), and my own JavaScript
library [hex-games](https://github.com/uablrek/hex-games). Christians
work is available under [CC-BY-SA-4.0](
https://creativecommons.org/licenses/by-sa/4.0/) license on [gitlab](
https://gitlab.com/wargames_tex/naw_tex), and on [BGG](
https://boardgamegeek.com/filepage/278514/printn-play-pdf-including-board-counters-rules-and).

Christian also provide an excellent [Vassal module](
https://vassalengine.org/library/projects/napoleon_at_waterloo_cholmcc),
so a fair question is "Why do I bother?". The answer is that, as a
retired programmer, I code hobby projects for fun and to learn.
[Hex-games](https://github.com/uablrek/hex-games) is my first
JavaScript project, and "Napoleon at Waterloo" is a good game to start
with. My first attempt was [Rise and Decline of the Third
Reich](https://github.com/uablrek/hex-games/blob/main/rdtr/README.md),
but it is *far, far* too complex.

This game use the [Basic rules](
https://gitlab.com/wargames_tex/naw_tex/-/jobs/12248823149/artifacts/file/NapoleonAtWaterloo-A4-master/NapoleonAtWaterlooBasicA4.pdf).


## Development

I document the development process for myself and others.

### The map

The map image is taken form the Vassal module, and resized to a
browser friendly size (I hope) with [imagemagick](https://imagemagick.org/):

```
unzip ~/Downloads/NapoleonAtWaterloo.vmod
convert images/Board.png -resize 70% waterloo.png
```

Next step is to configure a grid usable from javascript. I do like
this (there may better ways):

1. Compute approx hex size: the map has height 1237px and 17 hexes, so
   1237/17 ~ 72.7 is a start
2. `hex emit-grid --flattop --size 72.7 --rect 1691x1237 > grid.svg`
3. Load both the map and the grid in [inkscape](https://inkscape.org/)
4. Try to align the generated grid with the map grid
5. Adjust values and repeat from 2.

Size `71.6` gives a good result. But we must also have an offset, and
functions to compute the game hex identifiers, like `1204`, from
internal coordinates. I do this by writing a short program in
`grid/`. Final grid config:

```js
  grid.configure(71.6, 1.0, {x:12, y:26}, true)
```

The big challenge is to define all hexes. This is done with the
`map-maker/` program. It let you define terrain and edges by clicking
on the map. The result is the `map-data.json` file containing records
for hexes like:

```json
{"hex": {"x":15,"y":5}, "prop":"c", "edges":"r.r..."}
```

### Units

Units are defined in an array with records like:
```js
// 'ih' is initial hex, t:arrival turn
{nat:"al", type:"inf", sz:"x", ll:"Det", lbl:"1", stat:"1-4", ih:"1310"},
```

These are extended later, most importantly with a `.img` field
containing a generated image (Konva.Group). The index in the array
identifies the unit, and the Konva.Group id is set to `hunit${i}`,
where "i" is the index. This makes it possible to find the unit record
from the image, e.g. on a click.

The basic types, like "inf" and "cav" are provided by the `hex-games`
lib, but the multi-colored units, like the Dutch units, must get a new
type (inf-du) and be defined by this program. The colors are taken
from the pdf manual using `gpick`.

It is nice to see the result, so a small program that shows Order of
Battle (OoB) is in `units/`.

### Sequences

Sequences are the engine of the game, and goes into
`main.js`. Sequences consists of `phases`, or `steps` (same thing).
The active player moves to the next phase by pressing `Enter`. Help
for the phases can be written in a separate plain-text file.

The "top" sequence is (roughly):

1. Initial Deployment
2. French turn
3. Check French winner
4. Allied turn
5. Check Allied winner
6. Step turn and check end of game
7. Goto 2

The "turn" sequence is:

1. Check Reinforcements
2. Movement
3. Combat

For PvP (or AI) more steps are added. When the sequences are
defined, the game starts by calling:

```js
sequence.nextStep()
```

I find it useful to define sequences early. Empty steps during
development can be defined as:

```js
function updatePhase(seq) {
  const key = seq.name + '/' + seq.currentStep.name
  let txt = sequence.getSeqHelp(key)
  updateInfoBox(txt)
}
steps: [
  {
    //name: "not really needed for transient steps",
	start: sequence.proceed,
  },
  {
    name: "Movement",
	start: updatePhase,
  },
]
```
This let you test the sequences and phase help-text.

### User Interface

The User Interface (UI) is about handling events like mouse clicks or
key presses, and presenting info to the user. To drag the board is
handled already by `Konva`.

The game state: phase, turn, current player, etc. is shown in an
"InfoBox". The InfoBox is in a fixed position (when the board is
dragged), and can't be closed. Other boxes, like a HelpBox or a CRT
(Combat Result Table), may be opened on demand, and can be closed.

### First test

Movement and Combat are not implemented, but you may test initial
deployment, and sequences.

### Movement

The movement rules in NaW are simple, so the `grid.movementAxial`
function can be used. As before a test program is in `movement/`.

The Zone of Control (ZOC) must be computed before movement.

### Combat

Combat is made harder because units may attack multiple hexes.
