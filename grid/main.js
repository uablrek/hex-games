// SPDX-License-Identifier: CC-BY-4.0.
import Konva from 'konva'
import {grid, ui} from '@uablrek/hex-games'
// Imports image data to the bundle. Must be on top level
import gridData from './grid.svg'

const board = ui.stage()
const href = new URL(location.href)
const p = href.searchParams.get("pattern")
if (p == "svg") {
	// Pointy-top with map as SVG
	grid.configure(50, 1.1)
	const imageObj = new Image()
	imageObj.src = gridData;
	const gridImg = new Konva.Image({
		image: imageObj,
	});
	board.add(gridImg)
} else {
	// Flat-top, Konva generated rect with fillPattern
	let size=60, scale=1.0, flattop=false
	if (p) {
		let w = p.split(',')
		size = Number(w[0])
		if (w.length > 1) scale = Number(w[1])
		if (w.length > 2 && w[2] == 'flat') flattop=true
	}
	grid.configure(size, scale, {x:0, y:0}, flattop)
	let pattern = new Image()
	pattern.src = grid.patternSvg()
	pattern.onload = () => {
		console.log(`img h=${pattern.height}, w=${pattern.width}`)
		const hexGrid = new Konva.Rect({
			x: 0,
			y: 0,
			width: 4000,
			height: 4000,
			stroke: 'black',
			fillPatternImage: pattern,
			fillPatternRepeat: 'repeat',
			fillPatternScale: grid.patternScale(),
		})
		board.add(hexGrid)
		createHexId()
		board.add(hexIds)
		createAxId()
		board.add(axIds)
	}
}

// Add a "marker" that can be moved to hexes
marker = new Konva.Circle({
	radius: 15,
	fill: "red",
	stroke: 'black',
	strokeWidth: 1
});
initMarker = {x:11,y:8}
marker.position(grid.hexToPixel(initMarker))
board.add(marker)

function toAxial(hex) {
	const o = grid.hexToAxial(initMarker)
	// Make the original marker position the center
	const ax = grid.hexToAxial(hex)
	return {r:ax.r - o.r, q: ax.q - o.q}
}

// Create an "info" layer that stays in place (on top, to the left)
// when the map (grid) is dragged.
const info = new Konva.Layer()
board.getStage().add(info);
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
axial = toAxial(initMarker)
axialText.text(`r:${axial.r}, q:${axial.q}`)

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
	h = grid.pixelToHex(pos)
	hexText.text(`${h.x}, ${h.y}`)
	axial = toAxial(h)
	axialText.text(`r:${axial.r}, q:${axial.q}`)
	ph = grid.hexToPixel(h)
	marker.x(ph.x)
	marker.y(ph.y)
});

// ----------------------------------------------------------------------
// Hex id's

function hexToId(hex) {
	const x = String(hex.x).padStart(2, '0')
	const y = String(hex.y).padStart(2, '0')
	return `${x}${y}`
}
function axToId(ax) {
	return `${ax.r},${ax.q}`
}
let hexIds
function createHexId() {
	hexIds = new Konva.Group()
	for (let x = 1; x < 82; x++) {
		for (let y = 1; y < 57; y++) {
			const hex = {x:x,y:y}
			const pos = grid.hexToPixel(hex)
			const txt = new Konva.Text({
				text: hexToId(hex),
				position: pos,
				fill: 'gray',
			})
			txt.offsetX(txt.width() / 2)
			txt.offsetY(24)
			hexIds.add(txt)
		}
	}
	hexIds.cache()
}
let axIds
function createAxId() {
	axIds = new Konva.Group()
	for (let x = 1; x < 82; x++) {
		for (let y = 1; y < 57; y++) {
			const hex = {x:x,y:y}
			const pos = grid.hexToPixel(hex)
			const ax = toAxial(hex)
			const s = -ax.r - ax.q
			const txt = new Konva.Text({
				text: `${ax.r},${ax.q},${s}`,
				position: pos,
				fill: 'gray',
			})
			txt.offsetX(txt.width() / 2)
			axIds.add(txt)
		}
	}
	axIds.cache()
}
