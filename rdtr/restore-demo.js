// SPDX-License-Identifier: CC0-1.0.
/*
  Restore a previously stored deployment
 */
import Konva from 'konva';
import * as rdtr from './rdtr.js'
import * as unit from './units.js'

let stage = new Konva.Stage({
	container: "container",
	width: window.innerWidth,
	height: window.innerHeight,
});
let board = new Konva.Layer({
	draggable: true,
});
stage.add(board)
board.add(rdtr.map)

/*
  While "require" works here, IT CAN'T BE USED IRL!

  The "require" loads the file *once* (not possible to restore
  anything else later), AND it will include the file in the bundle (by
  the bundler, esbuild).

  In the real code a "trick" is used. The save is actually a tiny
  javascript program:

    const rdtrSaveData = '(json data goes here...)'

  This is included in a <script> tag *before* the game bundle.

  I got this from the few answers that actually understood the word
  "local", the others doesn't work without a server (including fetch()):

    https://stackoverflow.com/questions/7346563/loading-local-json-file
*/
let save = require('./test-deployment.json')

// (we know version==1, but for the sake of completeness...)
if (save.version > 1) {
	alert(`Version not supported ${save.version}`)
} else {
	for (const ud of save.deployment.units) {
		let u = unit.fromStr(ud.u)
		unit.placeRdtr(u, ud.hex, parent=board)
	}
}
