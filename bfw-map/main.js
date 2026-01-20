// SPDX-License-Identifier: CC0-1.0.
import Konva from 'konva';
import * as hex from './hex-grid.js';
// Imports image data to the bundle. Must be on top level
import wn2Data from './wn2.png'

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,
});
const board = new Konva.Layer({
	draggable: true,
});
stage.add(board)

async function imageLoaded(img) {
	return new Promise(resolve => img.onload = resolve)
}

;(async () => {
	const mapImg = new Image()
	mapImg.src = wn2Data
	await imageLoaded(mapImg)
	const map = new Konva.Image({
		image: mapImg,
	})
	board.add(map)

	hex.configure(72, 0.865, {x:10, y:-34}, true)
	const gridImg = new Image()
	gridImg.src = hex.patternSvg()
	await imageLoaded(gridImg)
	const grid = new Konva.Rect({
		width: map.width(),
		height: map.height(),
		stroke: 'black',
		opacity: 0.5,
		fillPatternImage: gridImg,
		fillPatternOffset: {x: 10, y:38},
		fillPatternScale: hex.patternScale(),
	})
	board.add(grid)

	// Add a "marker" that can be moved to hexes
	const initMarker = {x:10,y:4}
	marker = new Konva.Circle({
		radius: 15,
		fill: "red",
		stroke: 'black',
		strokeWidth: 2,
	})
	marker.position(hex.hexToPixel(initMarker))
	board.add(marker)
	board.on('click', function() {
		let pos = board.getRelativePointerPosition()
		let h = hex.pixelToHex(pos)
		let ph = hex.hexToPixel(h)
		marker.position(ph)
	})
})()
