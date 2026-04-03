// SPDX-License-Identifier: CC0-1.0.
/*
  This is a movement test for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import {ui, grid, box, unit, map} from '@uablrek/hex-games'
import {units, unitInit} from './naw-units.js'
import mapData from './waterloo.png'
import mapProperties from './map-data.json'

const board = ui.stage()		// (board is a draggable Konva.Layer)
const info = new Konva.Layer({name: "info"})
let infoBox

// ----------------------------------------------------------------------
// InfoBox

const help = `Keys:
^'Enter' - Flip sides
^'d' - Delete selected unit
^'r' - Regret move
^'Space' - Rotate stack
^
^Click on a unit to select it. Possible moves are shown for friendly
units that haven't already moved. Click on a marked hex to move the unit.
Moved units are marked. Over-stacking (2) is allowed during
movement. All units are draggable
`
function createInfoBox() {
	infoBox = box.info({
        x: window.innerWidth - 450,
        y: 30,
        width: 400,
        height: 400,
        destroyable: false,
    })
	let shelp = help.replaceAll('\n', ' ').replaceAll('^', '\n')
    updateInfoBox(shelp)
	info.add(infoBox)
}
function updateInfoBox(info) {
	let txt = ''
	txt += info
	box.update(infoBox, txt)
}

// ----------------------------------------------------------------------
// Setup
// We use the initial deployment, but all units are draggable
// Kbd 'Enter' is used to flip sides. ZOC is always shown.

let nat = 'fr'
ui.setKeys([
	{key:'Enter', fn:flipSides},
	{key:'r', fn:regretMove},
	{key:'d', fn:deleteUnit},
	{key:' ', fn:rotateStack},
])
function flipSides() {
	clearMoves()
	for (const h of map.hexMap.values()) {
		if (h.units && h.units.size > 1) {
			alert("Move or delete over-stacked units!")
			return
		}
	}
	for (const u of units) {
		u.ohex = null
		unit.removeMark1(u)
	}
	if (nat == 'fr')
		nat = 'al'
	else
		nat = 'fr'
	computeZOC()
}
function regretMove(e) {
	unit.regretMove(selectedUnit)
}
function rotateStack(e) {
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	unit.rotateStack(hex)
}
function deleteUnit(e) {
	unit.remove(selectedUnit)
	clearMoves()
	selectedUnit = null
}
function setup() {
	// Initial Deployment
	for (const u of units) {
		if (!('ih' in u)) continue
		const hex = nawToHex(u.ih)
		unit.moveTo(u, hex, false)
		board.add(u.img)
		u.img.draggable(true)
		u.img.on('click', unitOnClick)
		u.img.on('dragstart', (e)=>{e.target.moveToTop()})
		u.img.on('dragend', unitDragEnd)
	}
	board.on('click', boardOnClick)
	grid.mapFunctions(map.getAxial)
	for (const h of map.hexMap.values()) {
		// ZOC is never blocked (under basic rules), so pre-compute
		// *before* the "blocked" function is defined.
		h.neighZoc = grid.neighboursAxial(h.ax)
	}
	// *Now* define the mapFunctions!
	grid.mapFunctions(map.getAxial, blocked, getMovementCost, removeD)
	computeZOC()
	
}
let selectedUnit
function unitOnClick(e) {
	const u = unit.fromImg(e.target)
	if (u.nat == nat && reachableHexes) {
		// This *may* be a click to move an already selected unit.
		// Temporary over-stacking is allowed, provided that the unit
		// we move on top of hasn't moved yet
		const h = map.getHex(u.hex)
		if (reachableHexes.has(h)) {
			moveUnit(selectedUnit, h)
			clearMoves()
			return
		}
	}
	u.img.moveToTop()
	clearMoves()
	selectedUnit = u
	if (selectedUnit.nat == nat) showMoves()
}
function unitDragEnd(e) {
	clearMoves()
	selectedUnit = unit.fromImg(e.target)
	let hex = grid.pixelToHex(e.target.position())
	unit.moveTo(selectedUnit, hex, false)
	computeZOC()
}
function boardOnClick(e) {
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	let h = map.getHex(hex)
	moveUnit(selectedUnit, h)
}
function nawToHex(id) {
	const x = parseInt(id.substring(0,2), 10) + 3
	const y = parseInt(id.substring(2), 10)
	return {x:x,y:y}
}
let zocMarkers
const zocTemplate = new Konva.Circle({
	radius: 10,
	stroke: 'red',
})
function computeZOC() {
	// Clear
	if (zocMarkers) zocMarkers.destroy()
	for (const h of map.hexMap.values()) h.zoc = 0
	// Mark ZOC hexes
	for (const u of units) {
		if (!u.hex) continue
		if (u.nat == nat) continue
		const h = map.getHex(u.hex)
		h.zoc = 10				// Mark the own hex
		for (const n of h.neighZoc) if (n) n.zoc++
	}
	// Update markers
	zocMarkers = new Konva.Group()
	for (const h of map.hexMap.values()) {
		if (h.zoc == 0 || h.zoc >= 10) continue
		let marker = zocTemplate.clone()
		marker.position(grid.hexToPixel(h.hex))
		//console.log(h.hex)
		zocMarkers.add(marker)
	}
	board.add(zocMarkers)
}

// ----------------------------------------------------------------------
// Movement

function removeD() {
	for (const h of map.hexMap.values()) h.d = 0
}
function blocked(h, n, i) {
	// Check if the edge has a road
	if (h.edges && h.edges.charAt(i) == 'r') return false
	// Under basic rules, we may not enter forrest hexes
	if (n.prop.includes('f')) return true
	// We can't leave a forrest, except via a road
	if (h.prop.includes('f')) return true
	return false
}
// From 'h' to 'n' over edge 'i'. userRef is the unit
function getMovementCost(h, n, i, userRef) {
	// If we are in ZOC, we can't move
	if (h.zoc) return 100
	// All others 1 (the blocked function takes care of roads and forrests)
	return 1
}

// Mark possible movements for the 'selectedUnit'
let movMarkers
const movTemplate = new Konva.Circle({
	radius: 6,
	stroke: 'gray',
	fill: 'green',
})
let reachableHexes = null
function showMoves() {
	clearMoves()
	if (selectedUnit.nat != nat) return
	if (selectedUnit.ohex) return
	reachableHexes = grid.movementAxial(
		selectedUnit.m, grid.hexToAxial(selectedUnit.hex), selectedUnit)
	movMarkers = new Konva.Group()
	for (h of reachableHexes.values()) {
		const m = movTemplate.clone()
		m.position(grid.hexToPixel(h.hex))
		movMarkers.add(m)
	}
	board.add(movMarkers)
}
function clearMoves() {
	reachableHexes = null
	if (movMarkers) {
		movMarkers.destroy()
		movMarkers = null
	}
}
function moveUnit(u, h) {
	if (!u || !h || !reachableHexes) return
	if (u.ohex) return		// already moved
	if (!reachableHexes.has(h)) return
	clearMoves()
	unit.moveTo(u, h.hex)
}

// ----------------------------------------------------------------------
// Main
;(async () => {
	grid.configure(71.6, 1.0, {x:12, y:26}, true)
	const mapImage = await ui.mapImage(mapData)
	map.init({mapProperties: mapProperties})
	unit.config({ cornerRadius: unit.side*0.09 })
	await unitInit()
	board.add(mapImage)
	board.getStage().add(info)
	createInfoBox()
	setup()
})()
