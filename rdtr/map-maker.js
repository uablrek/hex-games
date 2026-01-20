// SPDX-License-Identifier: CC0-1.0.
/*
  This is the map-maker program for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
 */
import Konva from 'konva';
import * as rdtr from './rdtr.js';

//	{hex: {x:0,y:0}, nat:"", edges:"" ...},
let map = require('./rdtr-map.json')

function hexEqual(h1, h2) {
	if (h1.x != h2.x) return false
	if (h1.y != h2.y) return false
	return true
}
function getHex(hex) {
	for (const h of map) {
		if (hexEqual(hex, h.hex)) return h
	}
	let h = {hex:hex}
	map.push(h)
	return h
}
function saveMap() {
	const json = JSON.stringify(map)
	const blob = new Blob([json], { type: 'application/json' })
	rdtr.download(blob, 'rdtr-map.json')
}

async function imageLoaded(img) {
	return new Promise(resolve => img.onload = resolve)
}

function keydown(e) {
	if (e.key == "Shift") {
		deleteModeOn()
		return
	}
	if (e.key == "s") {
		if (e.repeat) return
		saveMap()
		return
	}
}
var deleteMode = false
function deleteModeOn() {
	deleteMode = true
	stage.container().style.cursor = 'not-allowed'
}
function deleteModeOff() {
	deleteMode = false
	stage.container().style.cursor = 'default'
}


// ----------------------------------------------------------------------
// "main"
var stage
;(async () => {
	const mapImg = new Image();
	mapImg.src = './rdtr-map.png'
	await imageLoaded(mapImg)

	stage = new Konva.Stage({
		container: container,
		width: window.innerWidth,
		height: window.innerHeight,
	});
	board = new Konva.Layer({
		draggable: true,
	});
	stage.add(board);
	board.add(new Konva.Image({
		image: mapImg,
	}))

	stage.container().tabIndex = 1
	stage.container().focus();
	stage.container().addEventListener("keydown", keydown)
	stage.container().addEventListener("keyup", (e) => {
		if (e.key == "Shift") {
			deleteModeOff()
		}
	})
	const marker = new Konva.Circle({
		radius: 10,
        fill: "red",
        stroke: 'black',
        stroke_width: 1
	})
	console.log(map.length)
	if (true) {
		for (const h of map) {
			if (h.nat != "uk") continue
			const pos = rdtr.hexToPixel(h.hex)
			board.add(marker.clone({
				x: pos.x,
				y: pos.y,
			}))
		}
	}
	board.on('click', function() {
        let pos = board.getRelativePointerPosition()
		let h = rdtr.pixelToHex(pos)
		let hex = getHex(h)
		hex.nat = "uk"
		pos = rdtr.hexToPixel(h)
		board.add(marker.clone({
			x: pos.x,
			y: pos.y,
		}))
	})
})()
