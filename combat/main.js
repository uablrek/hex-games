// SPDX-License-Identifier: CC0-1.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/movement
 */

import Konva from 'konva'
import {setup, grid, box, unit, map} from './hex-games.js'
import mapData from './example-map.svg'
import crtData from './crt.svg'
import mapProperties from './map-data.json'

let board = setup.stage()
const keyFn = [
	{key: 'h', fn:createHelpBox},
	{key: ' ', fn:removeMarkers},
	{key: 'a', fn:attack},
	{key:'ArrowLeft', fn: rotateStack},
	{key:'ArrowRight', fn: rotateStack},
]
setup.setKeys(keyFn)
let crt

const targetMarker = new Konva.Group()
targetMarker.add(new Konva.Circle({
	radius: 20,
    stroke: 'white',
}))
targetMarker.add(new Konva.Path({
    stroke: 'white',
	data: "M 0 -20 l 0 10 m 0 20 l 0 10 M -20 0 l 10 0 m 20 0 l 10 0",
}))
let markers
function setTargetMarker(h) {
	if (!markers) {
		markers = new Konva.Group()
		board.add(markers)
	}
	let pos = grid.hexToPixel(h.hex)
	markers.add(targetMarker.clone({
		position: pos,
	}))
}
function removeMarkers() {
	if (markers) {
		markers.destroy()
		markers = undefined
	}
	targetHex = null
	unsetAttackers()
	crtMarker.remove()
}

function boardOnClick(e) {
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	let h = map.getHex(hex)
	updateHexInfo(h, hex)
}

function rotateStack(e) {
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	unit.rotateStack(hex)
}

// ----------------------------------------------------------------------
// Units

const nations = {
	fr: {color: 'lightblue'},
	en: {color: '#cc4444'},
}

const units = [
	{nat:'fr', type:'inf', stat: "4-4", sz:'x', lbl:'Igrd 1', s: 4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'x', lbl:'Igrd 2', s: 4},
	{nat:'fr', type:'inf', stat: "3-4", sz:'x', lbl:'Igrd 3', s: 3},
	{nat:'fr', type:'inf', stat: "3-4", sz:'x', lbl:'Igrd 4', s: 3},
	{nat:'fr', type:'cav', stat: "3-6", sz:'x', lbl:'Hc 1', s: 3},
	{nat:'fr', type:'cav', stat: "3-6", sz:'x', lbl:'Hc 2', s: 3},
	{nat:'fr', type:'cav', stat: "3-6", sz:'x', lbl:'Hc 3', s: 3},
	{nat:'fr', type:'cav', stat: "3-6", sz:'x', lbl:'Hc 4', s: 3},
	{nat:'fr', type:'art', stat: "6-2", sz:'x', lbl:'N 1', s: 6},
	{nat:'en', type:'inf', stat: "3-4", sz:'x', lbl:'Sc 1', s: 3},
	{nat:'en', type:'inf', stat: "3-4", sz:'x', lbl:'Sc 2', s: 3},
	{nat:'en', type:'cav', stat: "3-6", sz:'x', lbl:'Ex 1', s: 3},
	{nat:'en', type:'cav', stat: "3-6", sz:'x', lbl:'Ex 2', s: 3},
]

function placeUnits() {
	let r = 4
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
	delete u.ohex
	let ohex = u.hex
    let hex = grid.pixelToHex(e.target.position())
	unit.moveTo(u, hex, tween=false)
	if (!u.hex) {
		// Can't move here! Probably off-map. Move the unit back
		unit.moveTo(u, ohex, tween=false)
	}
}

// ----------------------------------------------------------------------
// Combat

let targetHex
let attackers = new Set()
function unitClick(e) {
	let u = unit.fromImg(e.target)
	let h = map.getHex(u.hex)
	if (u.nat == 'en') {
		removeMarkers()
		setTargetMarker(h)
		targetHex = h
	} else {
		if (!targetHex) return
		// Units have range 1, except artillery which have 2
		let d = grid.axialDistance(targetHex.ax, h.ax)
		if (d <= 1 || u.type == 'art' && d <= 2) {
			attackers.add(u)
			unit.addMark1(u, 'red')
			computeOdds()
		}
	}
}
function unsetAttackers() {
	for (const u of attackers) unit.removeMark1(u)
	attackers.clear()
}
function computeOdds(die=0) {
	let a = 0, d = 0
	for (const u of attackers) {
		if (isUpslope(u.hex, targetHex) || isRiver(u.hex))
			a += (u.s/2)
		else
			a += u.s	
	}
	for (const u of targetHex.units) d += u.s
	if (targetHex.prop && targetHex.prop.includes('f')) d = d * 2
	console.log(`${a}:${d}`)
	updateCrt(a, d, die)
}
function isUpslope(hex, target) {
	let h = map.getHex(hex)
	if (!h.edges) return
	if (grid.axialDistance(h.ax, target.ax) > 1) return false
	let neighbours = grid.neighboursAxial(h.ax)
	let i
	for (i = 0; i < 6; i++)
		if (neighbours[i] == target) break
	return h.edges.charAt(i) == 'u'
}
function isRiver(hex) {
	let h = map.getHex(hex)
	return h.prop && h.prop.includes('r')
}

let crtMarker = new Konva.Circle({
	stroke: 'red',
	radius: 16,
})
function updateCrt(a, d, die=0) {
	let x = 2
	if (a >= d)
		x += (Math.floor(a/d) - 1)
	else
		x -= (Math.ceil(d/a) - 1)
	if (x > 5) x = 5
	if (x < 0) x = 0
	let pos = {x:x * 60 + 26, y:die*24+12}
	crtMarker.position(pos)
	if (!crtMarker.getParent())
		crt.add(crtMarker)
}
function attack() {
	if (!targetHex || attackers.size == 0) return
	let die = Math.floor(Math.random() * 6) + 1
	computeOdds(die)
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
		  'It is the French players combat phase. All units ' +
		  'may be dragged. No stacking limit. Click on an English unit ' +
		  'to start combat. Attack from a river, or up-slope is halved. ' +
		  'Defence in forrest is doubled\n\n' +
		  'h - This help\n' +
		  'a - Attack!\n'
		  "' ' - Remove Markers\n"
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
// Main
;(async () => {
	let mapImage = await map.mapImage(mapData)
	let crtImg = new Image()
	crtImg.src = crtData
	await new Promise(resolve => crtImg.onload = resolve)
	crt = new Konva.Group({
		draggable: true,
		x:1000,
		y:200,
	})
	crt.add(new Konva.Image({
		image: crtImg,
		scaleX: 1.2,
		scaleY: 1.2,
	}))
	
	await unit.init(units, nations, 0.75)
	map.init({
		width: 28,
		height: 23,
		mapProperties: mapProperties,
	})
	grid.mapFunctions(map.getAxial)
	board.add(mapImage)
	board.add(crt)
	//createHelpBox()
	createHexInfoBox()
	updateHexInfo()
	board.on('click', boardOnClick)
	placeUnits()
	crt.moveToTop()
})()
