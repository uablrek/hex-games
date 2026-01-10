// SPDX-License-Identifier: CC0-1.0.
import Konva from 'konva';
import * as rdtr from './rdtr.js';

/*
  This is a first test of the coordinate functions in "rdtr.js". They
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
stage.add(board);
board.add(rdtr.map);

// Add a "marker" that can be moved to hexes
initMarker = {x:10,y:4}
cc = rdtr.hexToPixel(initMarker)
marker = new Konva.Circle({
	x: cc.x,
	y: cc.y,
	radius: 15,
	fill: "red",
	stroke: 'black',
	stroke_width: 1
});
board.add(marker)

// Create an "info" layer that stays in place (on top, to the left)
// when the map is dragged.
const info = new Konva.Layer()
stage.add(info);
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

infoBox = textBox({
	x: 10,
	y: 10,
	width: 240,
	height: 180
}, "Instructions")
infoBox.findOne('.txt').text(
	'Click on the map to\nmove the marker\n\nGrab and move\nthe entire map')
info.add(infoBox)

hexBox = textBox({
	x: 10,
	y: 110,
	width: 240,
	height: 70
}, "Offset coordinates")
hexText = hexBox.findOne('.txt')
info.add(hexBox)
hexText.text(`${initMarker.x}, ${initMarker.y}`)

axialBox = textBox({
	x: 10,
	y: 150,
	width: 240,
	height: 70
}, "Axial coordinates")
axialText = axialBox.findOne('.txt')
info.add(axialBox)
axial = rdtr.hexToAxial(initMarker)
axialText.text(`${axial.q}, ${axial.r}`)

rdtrBox = textBox({
	x: 10,
	y: 190,
	width: 240,
	height: 70
}, "RDTR coordinates")
rdtrText = rdtrBox.findOne('.txt')
info.add(rdtrBox)
rc = rdtr.axialToRdtr(axial)
rdtrText.text(`${rc.r}, ${rc.q}`)

posBox = textBox({
	x: 10,
	y: 250,
	width: 240,
	height: 70
}, "Last click position")
clickText = posBox.findOne('.txt')
info.add(posBox)
console.log(window.innerHeight)
rdtr.map.on('click', function() {
	pos = rdtr.map.getRelativePointerPosition();
	clickText.text(`${pos.x}, ${pos.y}`)
	h = rdtr.pixelToHex(pos)
	hexText.text(`${h.x}, ${h.y}`)
	axial = rdtr.hexToAxial(h)
	axialText.text(`${axial.q}, ${axial.r}`)
	rc = rdtr.axialToRdtr(axial)
	rdtrText.text(`${rc.r}, ${rc.q}`)
	ph = rdtr.hexToPixel(h)
	marker.x(ph.x)
	marker.y(ph.y)
});
