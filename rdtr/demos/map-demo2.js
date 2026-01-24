// SPDX-License-Identifier: CC0-1.0.
/*
  This is map demo2 for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
  It displays movement ranges
*/

import Konva from 'konva'
import * as map from  './rdtr-map.js'
import * as unit from './units.js';
import * as box from './textbox.js';

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,
});
const board = new Konva.Layer({
	draggable: true,
});
stage.add(board)

stage.container().tabIndex = 1
stage.container().focus();
stage.container().addEventListener("keydown", keydown)

// Adjust position so a box is visible even if the board is dragged
function adjustBoxPos(pos) {
	return {x: pos.x - board.x(), y: pos.y - board.y()}
}

function keydown(e) {
	if (e.key == "p") {
		if (e.repeat) return
		flipPlayer()
		return
	}
	if (e.key == "z") {
		if (e.repeat) return
		showZOC()
		return
	}
	if (e.key == "h") {
		if (e.repeat) return
		createHelpBox()
		return
	}
}

box.destroyCallback((e) => {
	if (e == helpBox) helpBox = null
	if (e == turnBox) turnBox = null
})

let helpBox
function createHelpBox() {
	if (helpBox) return
	const txt =
		  "h - This help\n" +
		  "z - Toggle ZOC markers\n" +
		  "p - Flip Players\n" +
		  "Click-unit - Show moves\n" +
		  "Click map - Remove moves\n"
		  
	helpBox = box.info("Help", txt)
	helpBox.position(adjustBoxPos({x:900, y:200}))
	board.add(helpBox)
}

let player = "allies"
let enemies = ['ge']
let turnBox = null
function createTurnBox() {
	if (turnBox) return
	turnBox = box.info("Current Player", "", {
		width: 400,
		fontSize: 20,
	})
	turnBox.position(adjustBoxPos({x:200, y:100}))
	board.add(turnBox)
}
function updateTurnBox(txt) {
	if (!turnBox) return
	let txtObj = turnBox.findOne('.text')
	txtObj.text(txt)
}
// same for both sides in this demo
map.setNatAllowed(new Set(["ge","uk","fr","po","be","nl","lx","dk"]))

function flipPlayer() {
	createTurnBox()
	if (player == "allies") {
		player = "axis"
		updateTurnBox("Current player: axis. ZOC set for allies")
		enemies = ['uk','fr']
	} else {
		player = "allies"
		updateTurnBox("Current player: allies. ZOC set for axis")
		enemies = ['ge']
	}
	if (zocMarkers) {
		zocMarkers.destroy()
		zocMarkers = null
	}
	recomputeZOC()
}
function recomputeZOC() {
	map.clearZOC()
	for (const u of unit.units) {
		if (!u.hex) continue
		if (!enemies.includes(u.nat)) continue
		map.setZOC(u.hex, u.type == "pz")
	}
}

const marker = new Konva.Circle({
	radius: 8,
	fill: "green",
	stroke: 'black',
	stroke_width: 1,
})

// A Konva.Group containing all markers
let markers

function airMovementRange(hex) {
	if (markers) markers.destroy()
	markers = new Konva.Group()
	const ax = map.hexToAxial(hex)
	const s = map.inRangeAxial(8, ax)
	for (const h of s) {
		// h.prop must have any of "Ccp"
		if (!h.prop) continue
		if (h.prop.includes('C') || h.prop.includes('c') || h.prop.includes('p')){
			let pos = map.hexToPixel(h.hex)
			markers.add(marker.clone({
				position: pos,
			}))
		}
	}
	board.add(markers)
}

function markNeighbours(hex) {
	if (markers) markers.destroy()
	markers = new Konva.Group()
	const ax = map.hexToAxial(hex)
	for (const h of map.neighboursAxial(ax)) {
		if (!h) continue
		let pos = map.hexToPixel(h.hex)
		markers.add(marker.clone({
			position: pos,
		}))
	}
	board.add(markers)
}

function markGroundMovement(N, hex) {
	if (markers) markers.destroy()
	markers = new Konva.Group()
	const ax = map.hexToAxial(hex)
	for (const h of map.groundMovementAxial(N, ax)) {
		let pos = map.hexToPixel(h.hex)
		markers.add(marker.clone({
			position: pos,
		}))
	}
	board.add(markers)
}

function placeUnits() {
	let u, rc
	u = unit.fromStr("ge,pz,4-6")
	rc = {r:'L', q:31}
	unit.placeRdtr(u, rc, board)
	u = unit.fromStr("ge,pz,4-6")
	rc = {r:'L', q:29}
	unit.placeRdtr(u, rc, board)
	u = unit.fromStr("ge,inf,3-3")
	rc = {r:'L', q:30}
	unit.placeRdtr(u, rc, board)
	u = unit.fromStr("fr,pz,3-5")
	rc = {r:'O', q:22}
	unit.placeRdtr(u, rc, board)
	u = unit.fromStr("fr,inf,2-3")
	rc = {r:'M', q:24}
	unit.placeRdtr(u, rc, board)
	u = unit.fromStr("fr,inf,2-3")
	rc = {r:'N', q:24}
	unit.placeRdtr(u, rc, board)
	u = unit.fromStr("fr,inf,2-3")
	rc = {r:'O', q:24}
	unit.placeRdtr(u, rc, board)
	u = unit.fromStr("fr,inf,2-3")
	rc = {r:'P', q:24}
	unit.placeRdtr(u, rc, board)
	u = unit.fromStr("uk,inf,3-4")
	rc = {r:'K', q:23}
	unit.placeRdtr(u, rc, board)
	for (const u of unit.units) {
		u.img.on('click', showUnitMoves)
	}
}
function showUnitMoves(e) {
	if (markers) markers.destroy()
	const u = unit.fromImage(e.target)
	if (enemies.includes(u.nat)) return // enemies may not move!
	markGroundMovement(u.m, u.hex)
}

let zocMarkers
let zoc = new Konva.Circle({
	radius: 10,
	stroke: 'red',
})
function showZOC() {
	if (markers) {
		markers.destroy()
		markers = null
	}
	if (zocMarkers) {
		zocMarkers.destroy()
		zocMarkers = null
		return
	}
	recomputeZOC()
	zocMarkers = new Konva.Group()
	let s = map.getZOC()
	for (const h of s) {
		let pos = map.hexToPixel(h.hex)
		zocMarkers.add(zoc.clone({
			position: pos,
		}))
	}
	board.add(zocMarkers)
}

board.on('click', function() {
	const pos = board.getRelativePointerPosition();
	let hex = map.pixelToHex(pos)
	let h = map.getHex(hex)
	if (!h || !h.units || h.units.size == 0) {
		if (markers) markers.destroy()
	}
	//airMovementRange(h)
	//markNeighbours(h)
	//markGroundMovement(4, h)
})


// ----------------------------------------------------------------------
// "main"
;(async () => {
	await map.load(board)
	placeUnits()
	createHelpBox()
})()
