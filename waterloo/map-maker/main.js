// SPDX-License-Identifier: CC0-1.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/map-maker
 */

import Konva from 'konva'
import {ui, grid, box, lsave} from '@uablrek/hex-games'
import mapData from './waterloo.png'
import mapProperties from './map-data.json'

let board = ui.stage()
const info = new Konva.Layer({name: "info"})

const keyFn = [
	{key: 'j', fn: function (e) {
		lsave.saveJSON(mapProperties, 'map-data.json')
	}},
	{key: '?', fn: createHelpBox},
	{key: '.', fn:setEdge},
	{key: ' ', fn:setEdge},
	{key: 'r', fn:setEdge},
	{key: 'x', fn:setEdge},
	{key: 'n', fn:setEdge},
	{key: 'c', fn:setFunc},
	{key: 'C', fn:setFunc},
	{key: 'h', fn:setFunc},
	{key: 'H', fn:setFunc},
	{key: 'f', fn:setFunc},
	{key: 'F', fn:setFunc},
	{key: 's', fn:setFunc},
	{key: 'S', fn:setFunc},
	{key: 'e', fn:setFunc},
	{key: 'E', fn:setFunc},
	{key: '-', fn:setFunc},
	{key: 'p', fn:function (e) {if (propMarkFn) propMarkFn()}},
]
function setFunc(e) {
	discardEdge()
	func = e.key
	updateFunc()
	updateHexInfo()
}
ui.setKeys(keyFn)

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
	for (const h of mapProperties) {
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
	for (const h of mapProperties) {
		if (hexEqual(hex, h.hex)) return h
	}
	if (!create) return undefined
	let h = {hex:hex}
	mapProperties.push(h)
	return h
}

const helpTxt =
	  'h - This help\n' +
	  'j - Save map data\n' +
	  'p - Show properties or edges\n' +
	  '- - Examine hexes\n' +
	  'c,C - Clear set/delete\n' +
	  'f,F - Forrest set/delete\n' +
	  'h,H - Houses set/delete\n' +
	  's,S - Stout houses set/delete\n' +
	  'x,X - Forbidden set/delete\n' +
	  'e,E - Edge set/delete\n' +
	  'r,.,sp - Edge definition\n' +
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
	case 'c':
		funcText = "Set Clear"
		propMarkFn = markProp
		funcFn = setProp
		break
	case 'C':
		funcText = "Clear Clear"
		propMarkFn = markProp
		funcFn = clearProp
		break
	case 'h':
		funcText = "Set Houses"
		propMarkFn = markProp
		funcFn = setProp
		break
	case 'H':
		funcText = "Clear Houses"
		propMarkFn = markProp
		funcFn = clearProp
		break
	case 's':
		funcText = "Set Stout Houses"
		propMarkFn = markProp
		funcFn = setProp
		break
	case 'S':
		funcText = "Clear Stout Houses"
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
		width: 530,
		height: 120,
		x: window.innerWidth - 550,
		y: 20,
		label: "Hex Information",
		destroyable: false,
	})
	info.add(hexInfoBox)
}

function updateHexInfo(h, hex) {
	let txt = `Function: ${funcText}\n`
	if (h) {
		const id = hexToNaw(h.hex)
		txt += `Hex: ${h.hex.x},${h.hex.y} ${id}`
		if (h.prop) txt += `, prop: "${h.prop}"`
		if (h.edges) txt += `, edges: "${h.edges}"`
	} else {
		if (hex) {
			const id = hexToNaw(hex)
			txt += `Hex: ${hex.x},${hex.y} ${id}: undefined`
		}
	}
	box.update(hexInfoBox, txt)
}
function hexToNaw(hex) {
	const x = String(hex.x - 3).padStart(2, '0')
	const y = String(hex.y).padStart(2, '0')
	return x + y
}

// ----------------------------------------------------------------------
// Edges

var edgeHex = null
var edgeNo = 0
const edgeArrowTemplate = new Konva.Path({
	fill: 'green',
	stroke: 'black',
	strokeWidth: 3,
	data: "m 10 0 l 5 0 l -15 -20 l -15 20 l 5 0 l 0 20 l 20 0 l z",
})
let edgeArrow = null
function discardEdge() {
	if (!edgeHex) return
	delete edgeHex.edges
	if (edgeArrow) edgeArrow.destroy()
	edgeArrow = null
	edgeHex = null
	edgeNo = 0
}
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
	for (const h of mapProperties) {
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
			edgeArrow.destroy()
			edgeArrow = null
		} else {
			alert("Define all edges first")
			return
		}
	}
	edgeArrow = edgeArrowTemplate.clone()
	edgeHex = h
	edgeNo = 0
	let pos = grid.hexToPixel(h.hex)
	edgeArrow.position(pos)
	edgeArrow.rotate(60)
	board.add(edgeArrow)
	updateHexInfo(edgeHex)
}
function setEdge(e) {
	if (!edgeHex) return
	c = e.key
	if (c == ' ') c = '.'
	if (edgeNo == 0) edgeHex.edges=''
	edgeHex.edges += c
	updateHexInfo(edgeHex)
	edgeNo = edgeNo + 1
	if (edgeNo > 5) {
		edgeArrow.remove()
		edgeHex = null
		edgeNo = 0
		edgeArrow.rotate(60)
	} else {
		edgeArrow.rotate(60)
	}
}

// ----------------------------------------------------------------------
// Main
;(async () => {
	let map = await ui.mapImage(mapData, true)
	grid.configure(71.6, 1.0, {x:12, y:26}, true)
	board.add(map)
	board.getStage().add(info)
	createHelpBox()
	createHexInfoBox()
	updateHexInfo()
	board.on('click', boardOnClick)
})()
