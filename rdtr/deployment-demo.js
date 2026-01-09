// SPDX-License-Identifier: CC0-1.0.
/*
  Basic unit deployment. The idea is to use a Konva.Group with a Rect
  and unit images. The Group is draggable so it can be moved to an
  appropriate place on the map. When a unit is dragged from the Group,
  it is moved to the Board and will SnapToHex.
 */
import Konva from 'konva';
import * as rdtr from './rdtr.js';
import * as unit from './units.js';

rdtr.setStage('container')
const board = rdtr.board

rdtr.stage.container().tabIndex = 1
rdtr.stage.container().focus();
rdtr.stage.container().addEventListener("keydown", (e) => {
	if (!e.repeat) {
		if (e.key == "S") {
			saveGame()
		}
	}
});

// This is a prototype version. Later use: rdtr.saveGame()
function saveGame() {
	let save = { version: 1 }	// version==1 will never be used again
	save.deployment = rdtr.getDeplyment()
	const blob = new Blob([JSON.stringify(save)], { type: 'application/json' })
	rdtr.download(blob, "rdtr.json")
}

// deploymentBox is a prototype. Later use: rdtr.UnitBox
deploymentBox = new Konva.Group({
	x: 400,
	y: 400,
	draggable: true,
})
deploymentBox.add(new Konva.Rect({
	x: 0,
	y: 0,
	width: 400,
	height: 100,
	fill: 'gray',
	opacity: 0.5,
}))

function place(e) {
	// (I am amazed that this works!)
	e.target.moveTo(board)
	e.target.moveToTop()
	e.target.on('dragend', rdtr.unitSnapToHex)
	e.target.on('dragstart', rdtr.moveToTop)  // rplace myself!
}
// Sort out neutral units (nu) *except* white bridge-heads
var neutrals = []
for (let u of unit.units) {
	if (u.nat == "nu" && u.type != "bh") neutrals.push(u)
}
for (let u of neutrals) {
	u.img.on('dragstart', place)
	deploymentBox.add(u.img)
	let pos, x, y=20, o=60
	switch (u.type) {
	case "inf":
		x = 0
		if (u.s == 1) x += o
		break;
	case "air":
		x = o * 2
		break;
	case "nav":
		x = o * 3
		break;
	}
	u.img.position({x:x + 30, y:y})
}
board.add(deploymentBox)
