// SPDX-License-Identifier: CC0-1.0.
/*
  This is map demo2 for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
  It displays movement ranges
*/

import Konva from 'konva'
import * as map from  './rdtr-map.js'
import * as unit from './rdtr-unit.js'
import {setup, grid, box} from './hex-games.js'

const board = setup.stage()
const keyFn = [
	{key:'p', fn:flipPlayer},
	{key:'z', fn:showZOC},
	{key:'h', fn:createHelpBox},
]
setup.setKeys(keyFn)

// Adjust position so a box is visible even if the board is dragged
function adjustBoxPos(pos) {
	return {x: pos.x - board.x(), y: pos.y - board.y()}
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
		  "Click map - Remove moves"
		  
	helpBox = box.info({
		label: "Help",
		text: txt,
	})
	helpBox.position(adjustBoxPos({x:900, y:200}))
	board.add(helpBox)
}

let player = "allies"
let enemies = ['ge']
let turnBox = null
function createTurnBox() {
	if (turnBox) return
	turnBox = box.info({
		label: "Current Player",
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
	radius: 5,
	fill: "lightgreen",
	stroke: 'black',
	stroke_width: 1,
})

// A Konva.Group containing all markers
let markers

function airMovementRange(hex) {
	if (markers) markers.destroy()
	markers = new Konva.Group()
	const ax = grid.hexToAxial(hex)
	const s = grid.inRangeAxial(8, ax)
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
	for (const h of grid.neighboursAxial(ax)) {
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
	for (const h of grid.movementAxial(N, ax)) {
		let pos = map.hexToPixel(h.hex)
		markers.add(marker.clone({
			position: pos,
		}))
	}
	board.add(markers)
}

function placeUnits() {
	const deployment = JSON.parse(deployJson)
	for (const uh of deployment.units)
		unit.place(uh, board, true)
	for (const u of unit.units)
		u.img.on('click', showUnitMoves)
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
	recomputeZOC()
	if (markers) {
		markers.destroy()
		markers = null
	}
	if (zocMarkers) {
		zocMarkers.destroy()
		zocMarkers = null
		return
	}
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

const deployJson='{"units":[{"u":"fr,inf,2-3,,16","hex":{"x":16,"y":14},"i":9},{"u":"fr,inf,2-3,,18","hex":{"x":15,"y":13},"i":10},{"u":"fr,inf,2-3,,24","hex":{"x":15,"y":12},"i":11},{"u":"fr,pz,3-5,,1","hex":{"x":14,"y":15},"i":16},{"u":"uk,inf,3-4,,5","hex":{"x":13,"y":11},"i":386},{"u":"uk,pz,4-5,,13","hex":{"x":13,"y":12},"i":394},{"u":"ge,inf,3-3,,7","hex":{"x":18,"y":15},"i":483},{"u":"ge,inf,3-3,,8","hex":{"x":18,"y":14},"i":484},{"u":"ge,inf,3-3,,9","hex":{"x":18,"y":13},"i":485},{"u":"ge,pz,4-6,,14","hex":{"x":21,"y":12},"i":528},{"u":"ge,pz,4-6,,19","hex":{"x":22,"y":12},"i":529}]}'

// ----------------------------------------------------------------------
// "main"
;(async () => {
	await unit.init(board)
	await map.load(board)
	createHelpBox()
	placeUnits()
	board.on('click', function() {
		const pos = board.getRelativePointerPosition();
		let hex = map.pixelToHex(pos)
		let h = map.getHex(hex)
		if (!h || !h.units || h.units.size == 0) {
			if (markers) markers.destroy()
			//airMovementRange(hex)
			//markNeighbours(hex)
		}
	})
})()
