// SPDX-License-Identifier: CC0-1.0.
import Konva from 'konva';
import * as map from './rdtr-map.js';

/*
  This is a test of the coordinate functions in "rdtr-map.js". They
  are also tested in unit test in "test-rdtr.js".

  It also demonstrates a static, partially transparent, status field to
  the left in the window.
 */

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,
});
const board = new Konva.Layer({
	draggable: true,
});
stage.add(board)

// Add a "marker" that can be moved to hexes
const initMarker = {x:10,y:4}
const marker = new Konva.Circle({
	position: map.hexToPixel(initMarker),
	radius: 15,
	fill: "red",
	stroke: 'black',
	stroke_width: 1
})

// Create an "info" layer that stays in place (on top, to the left)
// when the map is dragged.
const info = new Konva.Layer()
info.add(new Konva.Rect({
	x: 0,
	y: 0,
	width: 300,
	height: window.innerHeight,
	fill:"lightgray",
	opacity: 0.5,				// (this looks nice!)
}))

function textBox(config, label) {
	box = new Konva.Group(config)
	box.add(new Konva.Rect({
		x: box.x(),
		y: box.y(),
		width: box.width(),
		height: box.height(),
		fill: 'gray',
		cornerRadius: 20,
		stroke: 'gold',
		strokeWidth: 3,
	}))
	box.add(new Konva.Text({
		x: box.x() + 8,
		y: box.y() + 4,
		text: label,
		fontSize: 18,
		fill: 'gold',
	}))
	box.add(new Konva.Text({
		x: box.x() + 8,
		y: box.y() + 30,
		fontSize: 20,
		fill: 'white',
		name: 'txt',
	}))
	return box
}

const infoBox = textBox({
	x: 10,
	y: 10,
	width: 240,
	height: 180
}, "Instructions")
infoBox.findOne('.txt').text(
	'Click on the map to\nmove the marker\n\nGrab and move\nthe entire map')
info.add(infoBox)

const hexBox = textBox({
	x: 10,
	y: 110,
	width: 240,
	height: 70
}, "Offset coordinates")
hexText = hexBox.findOne('.txt')
info.add(hexBox)
hexText.text(`${initMarker.x}, ${initMarker.y}`)

const axialBox = textBox({
	x: 10,
	y: 150,
	width: 240,
	height: 70
}, "Axial coordinates")
axialText = axialBox.findOne('.txt')
info.add(axialBox)
const axial = map.hexToAxial(initMarker)
axialText.text(`${axial.q}, ${axial.r}`)

const rdtrBox = textBox({
	x: 10,
	y: 190,
	width: 240,
	height: 70
}, "RDTR coordinates")
rdtrText = rdtrBox.findOne('.txt')
info.add(rdtrBox)
const rc = map.axialToRdtr(axial)
rdtrText.text(`${rc.r}, ${rc.q}`)

const posBox = textBox({
	x: 10,
	y: 250,
	width: 240,
	height: 70
}, "Last click position")
const clickText = posBox.findOne('.txt')
info.add(posBox)

board.on('click', function() {
	const pos = board.getRelativePointerPosition();
	clickText.text(`${pos.x}, ${pos.y}`)
	let h = map.pixelToHex(pos)
	hexText.text(`${h.x}, ${h.y}`)
	let axial = map.hexToAxial(h)
	axialText.text(`${axial.q}, ${axial.r}`)
	let rc = map.axialToRdtr(axial)
	rdtrText.text(`${rc.r}, ${rc.q}`)
	let ph = map.hexToPixel(h)
	marker.x(ph.x)
	marker.y(ph.y)
});

// ----------------------------------------------------------------------
// "main"
;(async () => {
	await map.load(board)
	stage.add(info)
	board.add(marker)
})()
