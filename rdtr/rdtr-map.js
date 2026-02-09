// SPDX-License-Identifier: CC0-1.0.
/*
  This is the map module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr

  The map-data, nationality, terrain, rivers, etc. is created with
  "map-maker.js", and stored as json. The map is stored as two
  hash-maps, one for offset coordinates (hex), and one for axial
  coordinates (ax).

  This is the procedure on a movement turn
  * setNatAllowed()
  * Clear previous player ZOC
  * Set ZOC for all "enemy" units (own hex + surrounding hexes for pz)
*/

import Konva from 'konva'

// Enable testing with node.js
var newImage = function() { return new Image() }
if (typeof document == 'undefined') newImage = function() { return {} }

// The Map image
import {mapImageData} from './png-data.js'
const mapImg = newImage();
mapImg.src = mapImageData
export const map = new Konva.Image({
    image: mapImg,
});

// Map Hexes:
// {hex: {x:0,y:0}, nat:"", edges:"" prop:""},
// Properties:
//   C - Capital
//   p - Port
//   B - Beach
//   M - Mountain
//   m - Marsh
//   c - City
//   O - Objective
//   F - Fort (Malta, Gibraltar)
//   f - Fort (Maginot line, West wall, Sevastopol, Leningrad)
//   s - Shore (fleets may transit)
//   v - Vichy
//   q - Quattra
//   E - Eastern Europe
//   2 - Occupied 1942
//   4 - Occupied 1944
//   e - Eastern Front

// Nations:
//   ge - Germany w
//   fr - France w
//   it - Italy m
//   po - Poland e
//   uk - UK w
//   sw - Sweden e
//   su - Sovjet Union e
//   no - Norway w
//   dk - Denmark w
//   nl - Netherlands w
//   be - Belgium w
//   lx - Luxenbourg w
//   ir - Ireland w
//   sp - Spain m
//   fi - Finland e
//   bl - Baltic States e
//   hu - Hungary w
//   ru - Rumania m
//   tu - Turkey m
//   gr - Greece m
//   yu - Yogoslavia m
//   bu - Bulgaria m
//   gi - Gibralter m
//   ml - Malta m
//   mo - Morocco m
//   al - Algeria m
//   ts - Tunisia m
//   le - Lebanon/Syria m
//   pe - Persia m
//   iq - Iraq m
//   eg - Egypt m
//   cy - Cyprus m
//   li - Libya m
//   ar - Arabia m
//   pa - Palestine m
//   tr - Transjordan m
//   pl - Portugal m
//   sz - Swizerland x

import mapData from './rdtr-map.json' with {type: "json"}
const hexHashMap = new Map()
for (const h of mapData) {
	if (!h.nat || h.nat == "sz") continue
	if (h.prop && h.prop.includes('q')) continue
	const k = h.hex.x + h.hex.y * 1000
	hexHashMap.set(k, h)
}
export function getHex(hex) {
	const k = hex.x + hex.y * 1000
	return hexHashMap.get(k)
}
const axialHashMap = new Map()
for (const h of mapData) {
	if (!h.nat || h.nat == "sz") continue
	if (h.prop && h.prop.includes('q')) continue
	const ax = hexToAxial(h.hex)
	h.ax = ax
	const k = ax.r + ax.q * 1000
	axialHashMap.set(k, h)
}
export function getAxial(ax) {
	const k = ax.r + ax.q * 1000
	return axialHashMap.get(k)
}

// Call with "await" to load the map synchronously
export async function load(board) {
	board.add(map)
	await new Promise(resolve => mapImg.onload = resolve)
}

// ----------------------------------------------------------------------
// Hex Coordinate Functions:
// The pixel functions uses offset coordinates (hex) for "pointy"
// hexes. They take --scale into account.

const hsize = 58.7;				// --size to hex.py
const hscale = 0.988;			// --scale to hex.py
const rsize = hsize * hscale * Math.sqrt(3) / 2;  // row interval
const grid_offset = {x:57, y:23}  // 0,0 on the map image

export function pixelToHex(pos) {
	// This function is NOT perfect! A click near the top/bottom of a
	// hex *may* select an adjacent hex. But for practical use, it's
	// good enough.

	// Adjust for grid/map offset
	pos = {x:pos.x + grid_offset.x, y:pos.y + grid_offset.y}
	let x, y = Math.round(pos.y / rsize - 0.42) // 0.42 ~= 5/12
	if (y % 2 == 0) {
		x = Math.round(pos.x / hsize)
	} else {
		x = Math.round(pos.x / hsize - 0.5)
	}
	return({x:x, y:y});
}
export function hexToPixel(hex) {
	let x, y = Math.round(hex.y * rsize + rsize/3)
	if (hex.y % 2 == 0) {
		x = Math.round(hex.x * hsize)
	} else {
		x = Math.round(hex.x * hsize + (hsize/2))
	}
	// Adjust for grid/map offset
	return({x:x - grid_offset.x, y:y - grid_offset.y});
}
export function hexToAxial(hex) {
	let q
	if (hex.y % 2 == 0) {
		q =  hex.x - hex.y / 2
	} else {
		q = hex.x - (hex.y - 1) / 2
	}
	return {q: q, r: hex.y}
}
export function axialToHex(ax) {
	let x
	if (ax.r % 2 == 0) {
		x = ax.q + ax.r / 2
	} else {
		x = ax.q + (ax.r - 1) / 2
	}
	return {x:x, y: ax.r}
}
// RDTR uses letters A-KK for row, and a positive int for q.
export function axialToRdtr(ax) {
	if (ax.r < 27) {
		r = String.fromCharCode(ax.r + 64)
	} else {
		let c = ax.r + 38
		r = String.fromCharCode(c, c)
	}
	return {q: ax.q + 15, r: r}
}
export function rdtrToAxial(rc) {
	r = rc.r.charCodeAt(0) - 64
	if (rc.r.length > 1) {
		r += 26
	}
	return {q: rc.q - 15, r: r}
}
export function rdtrToHex(rc) {
	return axialToHex(rdtrToAxial(rc))
}
export function hexToRdtr(hex) {
	return axialToRdtr(hexToAxial(hex))
}

// ----------------------------------------------------------------------
// Movement and Distance functions

// return a Set of map-hex objects of "N" distance from a hex (axial)
// https://www.redblobgames.com/grids/hexagons/#range-coordinate
export function inRangeAxial(N, ax) {
	let s = new Set()
	for (let q = -N; q <= N; q++) {
		for (let r = Math.max(-N, -q-N); r <= Math.min(+N, -q+N); r++) {
			let h = getAxial({r:ax.r+r, q:ax.q+q})
			if (h) s.add(h)
		}
	}
	return s
}

// https://www.redblobgames.com/grids/hexagons/#neighbors-axial
const neighbourOffset = [
	{r:-1, q:1},
	{r:0, q:1},
	{r:1, q:0},
	{r:1, q:-1},
	{r:0, q:-1},
	{r:-1, q:0},
]
// Get neighbours with respect to "edges"
export function neighboursAxial(ax) {
	let n = []
	let me = getAxial(ax)
	if (!me) return n
	for (const [i, o] of neighbourOffset.entries()) {
		// Check blocked edges
		if (me.edges && me.edges.charAt(i) == 'x') continue
		let h = getAxial({r:ax.r+o.r, q:ax.q+o.q})
		if (h) n.push(h)
	}
	return n
}
// Return a set of reachable map-hexes
export function groundMovementAxial(N, ax) {
	for (const h of mapData) delete h.d
	let me = getAxial(ax)
	let s = new Set()
	crawl(N, me, s)
	s.delete(me)
	return s
}
function crawl(N, h, s) {
	if (N < 0) return
	h.d = N 					// Movement-points left
	s.add(h)
	if (N == 0) return
	let neighbours = neighboursAxial(h.ax)
	for (const n of neighbours) {
		if (Object.hasOwn(n, 'd') && n.d > N) continue
		// Check if allowed territory
		if (!natAllowed.has(n.nat)) continue
		// Check if occupied by enemy units
		if (n.zoc && n.units && n.units.size > 0) continue
		if (h.zoc) {
			// It cost 3 mp to leave enemy ZOC
			crawl(N-3, n, s)
		} else {
			crawl(N-1, n, s)
		}
	}
}

// A Set of allowed nations to move in/to
let natAllowed
export function setNatAllowed(a) {
	natAllowed = a
}

// delete all .zoc fields
export function clearZOC() {
	for (const h of mapData) delete h.zoc
}
export function setZOC(hex, pz) {
	let h = getHex(hex)
	h.zoc = true
	if (!pz) return
	for (const n of neighboursAxial(h.ax)) {
		n.zoc = true
	}
}
// (for debugging)
export function getZOC() {
	let s = new Set()
	for (const h of mapData) {
		if (h.zoc) s.add(h)
	}
	return s
}

// ----------------------------------------------------------------------
// Unit functions:

export function unitsTotal() {
	let t = 0
	for (const h of mapData) {
		if (h.units) t += h.units.size
	}
	return t
}
export function unitsGet(hex) {
	const h = getHex(hex)
	if (!h) return null
	if (Object.hasOwn(h, 'units')) {
		return h.units
	}
	return null
}
export function unitAdd(u) {
	if (!u.hex) {
		alert("unitAdd without hex")
		return
	}
	const h = getHex(u.hex)
	if (!h) return				// place a unit at sea?
	if (!Object.hasOwn(h, 'units')) {
		h.units = new Set()
	}
	h.units.add(u)
}
export function unitRemove(u) {
	if (!u.hex) return			// will happen when dragges from a UnitBox
	const h = getHex(u.hex)
	if (!h) return				// placed at sea?
	if (!Object.hasOwn(h, 'units')) {
		// This is likely a BUG
		alert("unitRemove without units")
		return
	}
	h.units.delete(u)
}
export function unitMove(u, toHex) {
	unitRemove(u)
	u.hex = toHex
	unitAdd(u)
}

// ----------------------------------------------------------------------
const frontNat = {
	west: ["ge","fr","uk","no","dk","nl","be","lx","ir","hu"],
	east: ["po","sw","su","fi","bl"],
	med: ["it","sp","ru","tu","gr","yu","bu","gi","ml","mo","al","ts","le",
		  "pe","iq","eg","cy","li","ar","pa","tr","pl"]
}

export function front(hex) {
	const h = getHex(hex)
	if (!h || !h.nat) return ""
	if (h.prop && h.prop.includes('e')) return "east"
	for (const [f, n] of Object.entries(frontNat)) {
		if (n.includes(h.nat)) return f
	}
	return ""
}
