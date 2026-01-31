// SPDX-License-Identifier: CC0-1.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/map-maker
 */

import Konva from 'konva'
import * as grid from './hex-grid.js'
import * as box from './textbox.js'
import mapData from './example-map.svg'
import * as rdata from './remote-data.js'
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

// {hex: {x:0,y:0}, edges:"...uu." prop:"f"},
// Properties:
//   f - forrest
//   r - river
//   m - mountain
//   x - Forbidden
// Edges:
//   u - up-slope

const marker = new Konva.Circle({
	radius: 10,
    fill: "red",
    stroke: 'black',
    stroke_width: 1
})

let func = '-'
let funcText = "Examine hexes"
let funcFn
let propMarkFn
let propMarkers
// ----------------------------------------------------------------------
// Functions

function setProp(hex) {
	let h = getHex(hex)			// (will be created if needed)
	if (!h.prop) {
		h.prop = func
		return
	}
	if (h.prop.includes(func)) return
	h.prop += func
}
function clearProp(hex) {
	let h = getHex(hex, false)	// don't create
	if (!h) return
	if (!h.prop) return
	let p = func.toLowerCase()
	if (!h.prop.includes(p)) return
	h.prop = h.prop.replace(p, '')
}

function markProp() {
	let p = func.toLowerCase()
	if (propMarkers) propMarkers.destroy()
	if (marker.getParent()) marker.remove()
	propMarkers = new Konva.Group()
	const txt = new Konva.Text({
		fontStyle: 'bold',
		fontSize: 20,
		fill: 'red',
		text: p,
	})
	const offset = 9
	for (const h of map) {
		if (!h.prop) continue
		if (!h.prop.includes(p)) continue
		const pos = grid.hexToPixel(h.hex)
		propMarkers.add(txt.clone({
			x: pos.x - offset,
			y: pos.y - offset,
		}))
	}	
	board.add(propMarkers)
}
function moveMarker(h) {
	let pos = grid.hexToPixel(h)
	marker.position(pos)
	if (!marker.getParent()) {
		board.add(marker)
	}
}
function hexEqual(h1, h2) {
	if (h1.x != h2.x) return false
	if (h1.y != h2.y) return false
	return true
}
// Get a defined hex object, or create a new one
function getHex(hex, create=true) {
	for (const h of map) {
		if (hexEqual(hex, h.hex)) return h
	}
	if (!create) return undefined
	let h = {hex:hex}
	map.push(h)
	return h
}

function keydown(e) {
	if (e.key == "j") {
		if (e.repeat) return
		rdata.saveJSON(map, 'map-data.json')
		return
	}
	if (e.key == "h") {
		if (e.repeat) return
		createHelpBox()
		return
	}
	if (e.key == '.' || e.key == ' ' || e.key == 'u') {
		if (e.repeat) return
		setEdge(e.key)
		return
	}
	if (e.key == 'f' || e.key == 'F' ||
		e.key == 'e' || e.key == 'E' ||
		e.key == 'r' || e.key == 'R' ||
		e.key == 'x' || e.key == 'X' ||
		e.key == 'm' || e.key == 'M' || e.key == '-') {
		if (e.repeat) return
		func = e.key
		updateFunc()
		updateHexInfo()
		return
	}
	if (e.key == 'p') {
		if (e.repeat) return
		if (propMarkFn) propMarkFn()
		return
	}
}
const helpTxt =
	  'h - This help\n' +
	  'j - Save map data\n' +
	  'p - Show properties or edges\n' +
	  '- - Examine hexes\n' +
	  'f,F - Forrest set/delete\n' +
	  'r,R - River set/delete\n' +
	  'm,M - Mountain set/delete\n' +
	  'x,X - Forbidden set/delete\n' +
	  'e,E - Edge set/delete\n' +
	  'u,.,sp - Edge definition\n' +
	  ''

function updateFunc() {
	switch (func) {
	case 'x':
		funcText = "Set Forbidden"
		funcFn = setProp
		propMarkFn = markProp
		break
	case 'X':
		funcText = "Clear Forbidden"
		propMarkFn = markProp
		funcFn = clearProp
		break
	case 'f':
		funcText = "Set Forrest"
		funcFn = setProp
		propMarkFn = markProp
		break
	case 'F':
		funcText = "Clear Forrest"
		propMarkFn = markProp
		funcFn = clearProp
		break
	case 'r':
		funcText = "Set River"
		propMarkFn = markProp
		funcFn = setProp
		break
	case 'R':
		funcText = "Clear River"
		propMarkFn = markProp
		funcFn = clearProp
		break
	case 'm':
		funcText = "Set Mountain"
		propMarkFn = markProp
		funcFn = setProp
		break
	case 'M':
		funcText = "Clear Mountain"
		propMarkFn = markProp
		funcFn = clearProp
		break
	case 'e':
		funcText = "Set Edges"
		funcFn = selectEdgeHex
		propMarkFn = markEdge
		break
	case 'E':
		funcText = "Clear Edges"
		funcFn = clearEdge
		propMarkFn = markEdge
		break
	default:
		func = '-'
		funcText = "Examine hexes"
		funcFn = undefined
		propMarkFn = undefined
	}
}

function boardOnClick(e) {
	if (propMarkers) {
		propMarkers.destroy()
		propMarkers = undefined
	}
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	let h = getHex(hex, false)	// don't create just yet
	if (funcFn) {
		funcFn(hex)
		h = getHex(hex, false)	// It may have been defined by funcFn(hex)
	}
	updateHexInfo(h, hex)
	if (funcFn == selectEdgeHex)
		marker.remove()			// we have an arrow
	else
		moveMarker(hex)
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
	if (theHelpBox) return
	theHelpBox = box.info({
		x: 400,
		y: 200,
		label: "Help",
		text: helpTxt,
	})
	board.add(theHelpBox)
}

let hexInfoBox
function createHexInfoBox() {
	hexInfoBox = box.info({
		fontFamily: 'monospace',
		lineHeight: 1.6,
		width: 500,
		height: 120,
		x: 800,
		y: 20,
		label: "Hex Information",
		destroyable: false,
	})
	board.add(hexInfoBox)
}

function updateHexInfo(h, hex) {
	let txt = `Function: ${funcText}\n`
	if (h) {
		txt += `Hex: ${h.hex.x},${h.hex.y}`
		if (h.prop) txt += `, prop: "${h.prop}"`
		if (h.edges) txt += `, edges: "${h.edges}"`
	} else {
		if (hex) txt += `Hex: ${hex.x},${hex.y}, undefined`
	}
	box.update(hexInfoBox, txt)
}

// ----------------------------------------------------------------------
// Edges

var edgeHex = null
var edgeNo = 0
const edgeArrow = new Konva.Path({
	fill: 'green',
	stroke: 'black',
	strokeWidth: 3,
	data: "m 10 0 l 5 0 l -15 -20 l -15 20 l 5 0 l 0 20 l 20 0 l z",
	rotate: 30
})
function markEdge() {
	if (propMarkers) propMarkers.destroy()
	if (marker.getParent()) marker.remove()
	propMarkers = new Konva.Group()
	const txt = new Konva.Text({
		fontStyle: 'bold',
		fontSize: 20,
		fill: 'red',
		text: 'E',
	})
	const offset = 9
	for (const h of map) {
		if (!h.edges) continue
		const pos = grid.hexToPixel(h.hex)
		propMarkers.add(txt.clone({
			x: pos.x - offset,
			y: pos.y - offset,
		}))
	}
	board.add(propMarkers)
}
function clearEdge(hex) {
	let h = getHex(hex, false)	// don't create
	if (!h) return
	if (!h.edges) return
	delete h.edges
}
function selectEdgeHex(hex) {
	let h = getHex(hex)			// created if needed
	if (edgeHex == h) return
	if (edgeHex) {
		if (edgeNo == 0) {
			// No updates, restore the arrow
			edgeArrow.remove()
			edgeArrow.rotate(-30)
		} else {
			alert("Define all edges first")
			return
		}
	}
	edgeHex = h
	edgeNo = 0
	let pos = grid.hexToPixel(h.hex)
	edgeArrow.position(pos)
	edgeArrow.rotate(30)
	board.add(edgeArrow)
	updateHexInfo(edgeHex)
}
function setEdge(c) {
	if (!edgeHex) return
	if (c == ' ') c = '.'
	if (edgeNo == 0) edgeHex.edges=''
	edgeHex.edges += c
	updateHexInfo(edgeHex)
	edgeNo = edgeNo + 1
	if (edgeNo > 5) {
		edgeArrow.remove()
		edgeHex = null
		edgeNo = 0
		edgeArrow.rotate(30)
	} else {
		edgeArrow.rotate(60)
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
	board.add(map)
	createHelpBox()
	createHexInfoBox()
	updateHexInfo()
	board.on('click', boardOnClick)
})()
