// SPDX-License-Identifier: CC0-1.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/movement
 */

import Konva from 'konva'
import {setup, grid, box, unit, map} from './hex-games.js'
import mapData from './example-map.svg'
import mapProperties from './map-data.json'

let board = setup.stage()
const keyFn = [
    {key: 'h', fn:createHelpBox},
    {key: ' ', fn:removeMarkers},
	{key: 'z', fn:toggleZOC},
	{key: 'r', fn: function (e) {
		unit.regretMove(selectedUnit)
	}},
	{key:'ArrowLeft', fn: rotateStack},
	{key:'ArrowRight', fn: rotateStack},
]
setup.setKeys(keyFn)


const marker = new Konva.Circle({
	radius: 6,
    fill: "lightgreen",
    stroke: 'lightgray',
    stroke_width: 1
})
let markers
function setMarker(h) {
	if (!markers) {
		markers = new Konva.Group()
		board.add(markers)
	}
	let pos = grid.hexToPixel(h.hex)
	
	markers.add(marker.clone({
		position: pos,
	}))
}
function removeMarkers() {
	allowedHexes = null
	if (markers) {
		markers.destroy()
		markers = undefined
	}
}

function boardOnClick(e) {
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	let h = map.getHex(hex)
	updateHexInfo(h, hex)
	if (h) {
		let ah = map.getAxial(h.ax)
		if (h != ah) alert("We have a problem...")
		moveSelectedUnit(h)
	}
}

// ----------------------------------------------------------------------
// Units

const nations = {
	fr: {color: 'lightblue'},
	en: {color: '#cc4444'},
}

const units = [
	{nat:'fr', type:'nav', stat: "1-5", m: 5},
	{nat:'fr', type:'gen', stat: "0-8", lbl:'Nap', m: 8},
	{nat:'fr', type:'inf', stat: "3-4", sz:'x', lbl:'Igrd 1', m: 4},
	{nat:'fr', type:'inf', stat: "3-4", sz:'x', lbl:'Igrd 2', m: 4},
	{nat:'fr', type:'inf', stat: "3-4", sz:'x', lbl:'Igrd 3', m: 4},
	{nat:'fr', type:'cav', stat: "3-6", sz:'x', lbl:'Hc 1', m: 6},
	{nat:'fr', type:'cav', stat: "3-6", sz:'x', lbl:'Hc 2', m: 6},
	{nat:'fr', type:'art', stat: "8-(3)", sz:'x', lbl:'Bmb', m: 3},
	{nat:'en', type:'gen', stat: "0-8", lbl:'Well', m: 8},
	{nat:'en', type:'inf', stat: "3-4", sz:'x', lbl:'Sc 1', m: 4},
	{nat:'en', type:'inf', stat: "3-4", sz:'x', lbl:'Sc 2', m: 4},
	{nat:'en', type:'inf', stat: "3-4", sz:'x', lbl:'Sc 3', m: 4},
	{nat:'en', type:'cav', stat: "3-6", sz:'x', lbl:'Ex 1', m: 6},
	{nat:'en', type:'cav', stat: "3-6", sz:'x', lbl:'Ex 2', m: 6},
]

function placeUnits() {
	let r = 2
	for (const u of units) {
		if (u.nat != 'fr') continue
		placeUnit(u, {q:11,r:r})
		r++
	}
	r = 4
	for (const u of units) {
		if (u.nat != 'en') continue
		placeUnit(u, {q:5,r:r})
		r++
	}
	recomputeZOC()
}

function placeUnit(u, ax) {
	u.img.draggable(true)
	u.img.on('dragstart', dragStart)
	u.img.on('dragend', unitDragend)
	u.img.on('click', unitClick)
	let hex = grid.axialToHex(ax)
	unit.moveTo(u, hex, tween=false)
	board.add(u.img)
}
function dragStart(e) {
	removeMarkers()
	e.target.moveToTop()
}
function unitDragend(e) {
    let u = unit.fromImg(e.target)
	unit.removeMark1(u)
	delete u.ohex
	let ohex = u.hex
    let hex = grid.pixelToHex(e.target.position())
	unit.moveTo(u, hex, tween=false)
	if (!u.hex) {
		// Can't move here! Probably off-map. Move the unit back
		unit.moveTo(u, ohex, tween=false)
	}
	if (u.nat == 'en') recomputeZOC()
}

// ----------------------------------------------------------------------
// Boxes

function boxDestroy(box) {
	if (box == theHelpBox) {
		theHelpBox = null
		return
	}
}
box.destroyCallback(boxDestroy)

let theHelpBox
function createHelpBox() {
	const helpTxt =
		  'It is the French players movement phase. English units may not ' +
		  'be moved, but they may be dragged. English units have '+
		  'Zone of Control (ZOC). Stacking limit is 2.' +
		  'Unit that has moved get a red mark, drag it to remove\n\n' +
		  'h - This help\n' +
		  "' ' - Remove Markers\n" +
		  "z - Toggle ZOC markers\n" +
		  "r - Regret move"
	if (theHelpBox) return
	theHelpBox = box.info({
		x: 400,
		y: 200,
		width: 300,
		label: "Help",
		text: helpTxt,
	})
	board.add(theHelpBox)
}

let hexInfoBox
function createHexInfoBox() {
	hexInfoBox = box.info({
		fontFamily: 'monospace',
		width: 550,
		height: 80,
		x: 800,
		y: 20,
		label: "Hex Information",
		destroyable: false,
	})
	board.add(hexInfoBox)
}

function updateHexInfo(h, hex) {
	let txt
	if (h) {
		txt = `Hex: ${h.hex.x},${h.hex.y}, ax: ${h.ax.r},${h.ax.q}`
		if (h.prop) txt += `, prop: "${h.prop}"`
		if (h.edges) txt += `, edges: "${h.edges}"`
	} else {
		if (hex) txt = `Hex: ${hex.x},${hex.y}, undefined`
	}
	box.update(hexInfoBox, txt)
}

// ----------------------------------------------------------------------
// Movement

function removeD() {
	for (const h of map.hexMap.values()) delete h.d
}
function blocked(h, n, i) {
	if (!n.prop) return false
	return n.prop.includes('x')
}
function getMovementCost(h,n,i,u) {
	if (u.type == 'nav') {
		if (n.prop && n.prop.includes('w')) return 1
		return 100
	}
	if (n.units && n.units.size > 0) {
		// The hex is uccupied
		for (const u of n.units)
			if (u.nat == 'en') return 100
		// stacking limit is 2, but generals don't count
		if (n.units.size >= 2) {
			if (u.type != 'gen') {
				// Count the ground units
				let gu = 0
				for (const U of n.units) if (U.type != 'gen') gu++
				if (gu >= 2) return 100
			}
		}
	}
	if (h.zoc) return 3
	if (n.prop) {
		if (n.prop.includes('w')) return 100
		if (n.prop.includes('f')) {
			if (u.type == 'cav') return 3
			if (u.type == 'art') return 100
			return 2
		}
		if (n.prop.includes('m')) {
			if (u.type == 'cav' || u.type == 'art') return 100
			return 3
		}
	}
	if (h.prop && h.prop.includes('r')) return 2
	if (h.edges && h.edges.charAt(i) == 'u') return 3
	return 1
}
grid.mapFunctions(map.getAxial, blocked, getMovementCost, removeD)

let selectedUnit
let allowedHexes
function unitClick(e) {
	let u = unit.fromImg(e.target)
	let h = map.getHex(u.hex)
	// Check if this click i a movement-click (not a unit-select click)
	if (allowedHexes && allowedHexes.has(h)) return
	removeMarkers()				// (clears allowedHexes)
	selectedUnit = u
	if (u.nat == 'en') return	// French movement phase
	if (u.ohex) return			// Has already moved
	allowedHexes = grid.movementAxial(u.m, grid.hexToAxial(u.hex), u)
	for (const h of allowedHexes) setMarker(h)
}

function moveSelectedUnit(h) {
	if (!selectedUnit || !allowedHexes) return
	if (!allowedHexes.has(h)) return
	removeMarkers()
	unit.moveTo(selectedUnit, h.hex)
}
function recomputeZOC() {
	for (const h of map.hexMap.values()) delete h.zoc
	for (const u of units) {
		if (u.nat != 'en') continue
		if (u.type == 'gen') continue
		if (!u.hex) continue
		const h = map.getHex(u.hex)
		for (n of grid.neighboursAxial(h.ax)) {
			if (n) n.zoc = true
		}
	}
	// Remove ZOC on hexes occupied by english ground units. This is
	// not necessary for game logic, but makes markZOC look cleaner
	for (const u of units) {
		if (u.nat != 'en') continue
		if (u.type == 'gen') continue
		if (!u.hex) continue
		const h = map.getHex(u.hex)
		delete h.zoc
	}
	markZOC()
}
let zocMarkers
let zocMarker = new Konva.Circle({
	radius: 10,
	stroke: 'red',
})
function markZOC() {
	if (!zocMarkers) return
	zocMarkers.destroy()
	zocMarkers = new Konva.Group()
	for (const h of map.hexMap.values()) {
		if (h.zoc) {
			zocMarkers.add(zocMarker.clone({
				position: grid.hexToPixel(h.hex),
			}))
		}
	}
	board.add(zocMarkers)
}
function toggleZOC() {
	if (zocMarkers) {
		zocMarkers.destroy()
		zocMarkers = null
	} else {
		zocMarkers = new Konva.Group()
		markZOC()
	}
}

function rotateStack(e) {
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	unit.rotateStack(hex)
	removeMarkers()
}

// ----------------------------------------------------------------------
// Main
;(async () => {
	let mapImage = await map.mapImage(mapData)
	grid.configure(50)
	await unit.init(units, nations, 0.75)
	map.init({
        width: 28,
        height: 23,
        mapProperties: mapProperties,
    })
	board.add(mapImage)
	//createHelpBox()
	createHexInfoBox()
	updateHexInfo()
	board.on('click', boardOnClick)
	placeUnits()
})()
