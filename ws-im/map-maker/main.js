// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/ws-im/map-maker
 */

import Konva from 'konva'
import {ui, grid, box, lsave} from '@uablrek/hex-games'
import * as map from './map.js'
import mapProperties from './map-data.json'
export let board = ui.stage()
export const g = {}
const info = new Konva.Layer({name: "info"})
board.getStage().add(info)

const keyFn = [
	{key: 'j', fn: function (e) {
		removeUnsetHexes()
		lsave.saveJSON(mapProperties, 'map-data.json')
	}},
	{key: 'l', fn:drawLand},
	{key: 'd', fn:drawLand},
	{key: 'i', fn:map.toggleHexId},
	{key: '-', fn:setFunc},
	{key: 'c', fn:setFunc},
	{key: 'p', fn:function (e) {if (propMarkFn) propMarkFn()}},
]
for (let c = '0'; c <= '9'; c++)
	keyFn.push({key: c, fn:setFunc})
ui.setKeys(keyFn)

function setFunc(e) {
	func = e.key
	updateFunc()
	updateHexInfo()
}
function drawLand() {
	if (func < '0' || func > '9') return
	const graph = cycleGraph(func)
	if (!graph) {
		console.log("Invalid graph", func)
		return
	}
	const oldPath = board.findOne(`#poly${func}`)
	if (oldPath) oldPath.destroy()

	const points = []
	for (const hex of graph) {
		const pos = grid.hexToPixel(hex)
		if (hex.x == 0) pos.x -= 80
		if (hex.x == map.width-1) pos.x += 80
		points.push(pos.x)
		if (hex.y == 0) pos.y -= 80
		const edgeY = (hex.x % 2) ? map.height-1 : map.height
		if (hex.y == edgeY) pos.y += 80
		points.push(pos.y)
	}
	const polygon = new Konva.Line({
		points: points,
		stroke: 'beige',
		strokeWidth: 10,
		fill: '#040',
		id: `poly${func}`,
		closed: true,
		tension: 0.5,
		
	})
	// https://konvajs.org/docs/tweens/Tween_Filter.html
	polygon.filters([Konva.Filters.Blur])
	polygon.blurRadius(10)
	polygon.cache()
	board.add(polygon)

	// https://konvajs.org/docs/clipping/Clipping_Function.html
}

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

/*
  For each land area we want a plygon with the centers of the coastal
  line hexes as corners. A "plygon" is created as a closed Konva.Line.

  The path is a "Directed Cycle Graph" in graph theory. Please see:
  https://en.wikipedia.org/wiki/Cycle_graph

  While there are plenty of algorithms for *detecting* cyclic graphs,
  I didn't find any to *create* a Directed Cycle Graph from a number
  of coordinates (vertices), but I'm sure they exist.

  So, I make up an algorithm on my own. Crucial are the "neighbour
  hexes", "neighbours" from now on. The algorithm is recursive.
  NOTE: the algorithm will fail if the land have a "waist", that is
  only one hex wide (technically that mean 2 Cycle Graphs, sharing a vertex)

  1. Collecct all hexes belonging to the plygon, i.e. have the same id
  2. Exclude a polygon with <3 corners (hexes)
  3. Start at *any* hex belonging to the plygon, called Z from now on
  4. Pick a coast line neighbour that we have not visited before.
     If none are left, return null
  5. If this hex is Z:
     If all hexes are visited, we are done!
     Otherwise pick another neighbour (return null if none left)
  6. Make a recursive call to 4 for the selected hex
 */
function cycleGraph(id) {
	const v = new Map()
	let Z = null
	function key(ax) {return ax.q + 1000*ax.r}
	function getAxial(ax) {return v.get(key(ax)) }
	grid.mapFunctions(getAxial)
	for (const h of mapProperties) {
		if (h.prop == id) {
			const ax = grid.hexToAxial(h.hex)
			const o = {
				hex: h.hex,
				ax: ax,
			}
			if (!Z) Z = o
			v.set(key(ax), o)
		}
	}
	console.log(id, v.size)
	if (v.size < 3) return null
	for (const h of v.values()) h.n = grid.neighboursAxial(h.ax)
	// Special case:
	// To support land that goes off the edges (not islands), check for
	// coast line hexes at the edge of the map with only one neighbour.
	// This is an open graph, but we connect these edge hexes with each other.
	// NOTE: this doesn't look good if you put them in corners. Don't do that!
	function edgeHex(h) {
		if (h.hex.x == 0 || h.hex.y == 0 || h.hex.x == map.width-1) return true
		// On the lower edge, even x'ids get y==map.height
		const edgeY = (h.hex.x % 2) ? map.height-1 : map.height
		return h.hex.y == edgeY
	}
	function nNeighbours(h) {
		let count = 0
		for (n of h.n) if (n) count++
		return count
	}
	let e1, e2
	for (const h of v.values()) {
		if (edgeHex(h) && nNeighbours(h) == 1) {
			if (e1)
				e2 = h
			else
				e1 = h
		}
	}
	console.log("edges", e1, e2)
	if (e1 && e2) {
		e1.n.push(e2)
		e2.n.push(e1)
	}
	// All vertices are collected, now crawl!
	function crawl(o, a) {
		if (a.includes(o)) return null // already visited
		a.push(o)
		const i = a.length
		if (i > v.size) return null // cowardly check indefinite recursion
		for (const n of o.n) {
			if (!n) continue	// (sea hex)
			if (n == Z) {
				if (a.length == v.size) return a // success!
				continue
			}
			a.splice(i)			// restore the array before try next neighbour
			if (crawl(n, a)) return a
		}
		return null
	}
	const va = crawl(Z, [])
	if (va == null) return null	// may be an invalid graph
	// va is an array of internal objects, but we must return an array
	// of hex coordinates
	const a = []
	for (h of va) a.push(h.hex)
	console.log(a)
	return a
}
function removeUnsetHexes() {
	let haveUnset = true
	while (haveUnset) {
		haveUnset = false
		for (const [i, value] of mapProperties.entries()) {
			if (value.prop == "") {
				mapProperties.splice(i, 1)
				haveUnset = true
				break
			}
		}
	}
}

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
	h.prop = ""
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
	  'p - Show properties\n' +
	  'c - Delete properties\n' +
	  '- - Examine hexes\n' +
	  '1-9 - Coast line with this ID\n' +
	  ''

function updateFunc() {
	switch (func) {
	case 'c':
		funcText = "Clear Properties"
		propMarkFn = markProp
		funcFn = clearProp
		break
	case '-':
		funcText = "Examine hexes"
		funcFn = undefined
		propMarkFn = undefined
		break
	default:
		funcText = `Set coast line "${func}"`
		propMarkFn = markProp
		funcFn = setProp
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
	info.add(hexInfoBox)
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
// Main
;(async () => {
	await map.init({})
	createHelpBox()
	createHexInfoBox()
	updateHexInfo()
	board.on('click', boardOnClick)
})()
