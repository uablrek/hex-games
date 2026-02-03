// SPDX-License-Identifier: CC0-1.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/movement
 */

import Konva from 'konva'
import * as grid from './hex-grid.js'
import * as box from './textbox.js'
import * as unit from './units.js'
import mapData from './example-map.svg'
const map = require('./map-data.json')

// Init Konva
stage = new Konva.Stage({
	container: container,
	width: window.innerWidth,
	height: window.innerHeight,
})
board = new Konva.Layer({
	draggable: true,
})
stage.add(board)
stage.container().tabIndex = 1
stage.container().focus()
stage.container().addEventListener("keydown", keydown)

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

function keydown(e) {
	if (e.key == "h") {
		if (e.repeat) return
		createHelpBox()
		return
	}
	if (e.key == ' ') {
		if (e.repeat) return
		removeMarkers()
		return
	}
	if (e.key == 'z') {
		if (e.repeat) return
		toggleZOC()
		return
	}
	if (e.key == 'r') {
		if (e.repeat) return
		regretMove(selectedUnit)
		return
	}
}

function boardOnClick(e) {
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	let h = getHex(hex)
	updateHexInfo(h, hex)
	if (h) {
		let ah = getAxial(h.ax)
		if (h != ah) alert("We have a problem...")
		moveSelectedUnit(h)
	}
}


// ----------------------------------------------------------------------
// Map

const mapWidth = 28
const mapHeight = 23
const hexMap = new Map()
const axMap = new Map()
function initMap() {
	// The "map" is sparse, meaning that many hex'es are
	// "undefined". For the movementAxial() function to work, we must
	// define *all* hexes, and they must have a .ax field. Further, we
	// want to allow lookup with both offset and axial coordinates so
	// two Map's must be defined
	for (let x = 0; x < mapWidth; x++) {
		for (let y = 0; y < mapHeight; y++) {
			let hex, ax, h, key
			hex = {x:x,y:y}
			ax = grid.hexToAxial(hex)
			h = {hex:hex, ax:ax}
			key = x + 1000*y
			hexMap.set(key, h)
			key = ax.q + 1000*ax.r
			axMap.set(key, h)
		}
	}
	// Now all hex'es are defined, so add information from "map"
	for (const hp of map) {
		let h = getHex(hp.hex)
		if (!h) continue		// (outside map. May happen on map-edges)
		if (hp.prop) h.prop = hp.prop
		if (hp.edges) h.edges = hp.edges
	}
}
function getHex(hex) {
	const k = hex.x + hex.y * 1000
	return hexMap.get(k)
}
function getAxial(ax) {
	const k = ax.q + 1000*ax.r
	return axMap.get(k)
}
function removeUnitFromMap(u) {
	if (!u.hex) return
	let h = getHex(u.hex)
	if (!h.units) return
	h.units.delete(u)
	delete u.hex
}

function addUnitToMap(u, hex) {
	let h = getHex(hex)
	if (!h) return				// (off map?)
	u.hex = hex
	if (!h.units) h.units = new Set()
	h.units.add(u)
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
	moveUnitTo(u, hex)
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
	moveUnitTo(u, hex)
	if (!u.hex) {
		// Can't move here! Probably off-map. Move the unit back
		moveUnitTo(u, ohex)
	}
	if (u.nat == 'en') recomputeZOC()
}
function moveUnitTo(u, hex, tween=false) {
	if (!hex) return
	let ohex = u.hex
	removeUnitFromMap(u)
	addUnitToMap(u, hex)
	let pos = grid.hexToPixel(hex)
	if (tween) {
		unit.addMark1(u, 'red')
		u.ohex = ohex
		new Konva.Tween({
			node: selectedUnit.img,
			x: pos.x,
			y: pos.y,
			duration: 0.5,
			easing: Konva.Easings.EaseInOut,
		}).play()		
	} else
		u.img.position(pos)		// (snapToHex)
}
function regretMove(u) {
	if (!u) return
	if (!u.ohex) return
	moveUnitTo(u, u.ohex, true)
	unit.removeMark1(u)
	delete u.ohex
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
	for (const h of hexMap.values()) delete h.d
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
grid.mapFunctions(getAxial, blocked, getMovementCost, removeD)

let selectedUnit
let allowedHexes
function unitClick(e) {
	let u = unit.fromImg(e.target)
	let h = getHex(u.hex)
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
	moveUnitTo(selectedUnit, h.hex, true)
}
function recomputeZOC() {
	for (const h of hexMap.values()) delete h.zoc
	for (const u of units) {
		if (u.nat != 'en') continue
		if (u.type == 'gen') continue
		if (!u.hex) continue
		const h = getHex(u.hex)
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
		const h = getHex(u.hex)
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
	for (const h of hexMap.values()) {
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

// ----------------------------------------------------------------------
// Main
;(async () => {
	let mapImg = new Image()
	mapImg.src = mapData
	await new Promise(resolve => mapImg.onload = resolve)
	let map = new Konva.Image({
		image: mapImg,
	})
	grid.configure(50)
	// Lesson to learn:
	// An SVG map seems to be re-rendered on drag, which burns a lot
	// of CPU. Pre-render the map-image - and drag seem more or less free
	if (true) {
		mapImg = await map.toImage()
		map = new Konva.Image({
			image: mapImg,
		})
	}
	await unit.init(units, nations, 0.75)
	initMap()
	board.add(map)
	//createHelpBox()
	createHexInfoBox()
	updateHexInfo()
	board.on('click', boardOnClick)
	placeUnits()
})()
