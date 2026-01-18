// SPDX-License-Identifier: CC0-1.0.
import Konva from 'konva';
import * as hex from './hex-grid.js';
// Imports image data to the bundle. Must be on top level
import gridData from './grid.svg'

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,
});
const board = new Konva.Layer({
	draggable: true,
});
stage.add(board);

const href = new URL(location.href)
const p = href.searchParams.get("pattern")
if (p == "svg") {
	// Pointy-top with map as SVG
	hex.configure(50, 1.1)
	const imageObj = new Image()
	imageObj.src = gridData;
	const grid = new Konva.Image({
		image: imageObj,
	});
	board.add(grid)
} else {
	// Flat-top, Konva generated rect with fillPattern
	let size=50, scale=1.0, flattop=false
	if (p) {
		let w = p.split(',')
		size = Number(w[0])
		if (w.length > 1) scale = Number(w[1])
		if (w.length > 2 && w[2] == 'flat') flattop=true
	}
	hex.configure(size, scale, {x:0, y:0}, flattop)
	let pattern = new Image()
	pattern.src = hex.patternSvg()
	pattern.onload = () => {
		console.log(`img h=${pattern.height}, w=${pattern.width}`)
		const grid = new Konva.Rect({
			x: 0,
			y: 0,
			width: 4000,
			height: 4000,
			stroke: 'black',
			fillPatternImage: pattern,
			fillPatternRepeat: 'repeat',
			fillPatternScale: hex.patternScale(),
		})
		board.add(grid)
	}
}

// Add a "marker" that can be moved to hexes
marker = new Konva.Circle({
	radius: 15,
	fill: "red",
	stroke: 'black',
	strokeWidth: 1
});
initMarker = {x:10,y:4}
marker.position(hex.hexToPixel(initMarker))
board.add(marker)

// Create an "info" layer that stays in place (on top, to the left)
// when the map (grid) is dragged.
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
	'Click on the grid to\nmove the marker\n\nGrab and move\nthe entire grid')
info.add(infoBox)

hexBox = textBox({
	x: 10,
	y: 110,
	width: 240,
	height: 70
}, "Offset Coordinates")
hexText = hexBox.findOne('.txt')
info.add(hexBox)
hexText.text(`${initMarker.x}, ${initMarker.y}`)

axialBox = textBox({
	x: 10,
	y: 155,
	width: 240,
	height: 70
}, "Axial coordinates")
axialText = axialBox.findOne('.txt')
info.add(axialBox)
axial = hex.hexToAxial(initMarker)
axialText.text(`${axial.q}, ${axial.r}`)

posBox = textBox({
	x: 10,
	y: 220,
	width: 240,
	height: 70
}, "Last click position")
clickText = posBox.findOne('.txt')
info.add(posBox)

board.on('click', function() {
	pos = board.getRelativePointerPosition();
	clickText.text(`${pos.x}, ${pos.y}`)
	h = hex.pixelToHex(pos)
	hexText.text(`${h.x}, ${h.y}`)
	axial = hex.hexToAxial(h)
	axialText.text(`${axial.q}, ${axial.r}`)
	ph = hex.hexToPixel(h)
	marker.x(ph.x)
	marker.y(ph.y)
});
