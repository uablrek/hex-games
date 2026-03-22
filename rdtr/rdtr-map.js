// SPDX-License-Identifier: CC0-1.0.
/*
  This is the map module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr

  The map-data, nationality, terrain, rivers, etc. is created with
  "map-maker.js", and stored as "rdtr-map.json". The map is stored as two
  hash-maps, one for offset coordinates (hex), and one for axial
  coordinates (ax).
*/

import Konva from 'konva'
import {grid, map} from 'hex-games'
import * as images from './rdtr-images.js'

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

import mapProperties from './rdtr-map.json' with {type: "json"}
map.init({ mapProperties: mapProperties })

// Re-export to avoid map-map-map confusion
export const getHex = map.getHex
export const getAxial = map.getAxial
export const removeUnit = map.removeUnit
export const addUnit = map.addUnit

// Call with "await" to load the map synchronously
export async function load(board) {
	const _map = await images.map()
	board.add(_map)
	// Compute the visible area
	visibleArea.width = Math.ceil(board.width() / 58.7)
	visibleArea.height = Math.ceil(board.height()*2 / 58.7/0.988/Math.sqrt(3))
	console.log(visibleArea)
}
export var visibleArea = {width:0, height:0}
export const mapSize = {width:52, height:41}

// ----------------------------------------------------------------------
// Hex Coordinate Functions: (most re-exported)
grid.configure(58.7, 0.988, {x:57, y:23})
export const pixelToHex = grid.pixelToHex
export const hexToPixel = grid.hexToPixel
export const hexToAxial = grid.hexToAxial
export const axialToHex = grid.axialToHex

// RDTR uses letters A-KK for row, and a positive int for q.
export function axialToRdtr(ax) {
	let r
	if (ax.r < 27) {
		r = String.fromCharCode(ax.r + 64)
	} else {
		let c = ax.r + 38
		r = String.fromCharCode(c, c)
	}
	return {q: ax.q + 15, r: r}
}
export function rdtrToAxial(rc) {
	let r = rc.r.charCodeAt(0) - 64
	if (rc.r.length > 1) {
		r += 26
	}
	return {q: rc.q - 15, r: r}
}
export function rdtrToHex(rc) {
	return grid.axialToHex(rdtrToAxial(rc))
}
export function hexToRdtr(hex) {
	return axialToRdtr(grid.hexToAxial(hex))
}

// ----------------------------------------------------------------------
// Movement and Distance functions

function blocked(me, h, i) {
	return (me.edges && me.edges.charAt(i) == 'x')
}
function removeD() {
	for (const h of map.hexMap.values()) delete h.d
}
function getMovementCost(h, n, i, ref) {
	if (!n.nat) return 100
	if (!natAllowed.has(n.nat)) return 100
	if (n.zoc && n.units && n.units.size > 0) return 100
	if (h.zoc) return 3
	return 1
}
grid.mapFunctions(map.getAxial, blocked, getMovementCost, removeD)

// A Set of allowed nations to move in/to
let natAllowed
export function setNatAllowed(a) {
	natAllowed = a
}
// delete all .zoc fields
export function clearZOC() {
	for (const h of map.hexMap.values()) delete h.zoc
}
export function setZOC(hex, pz) {
	let h = map.getHex(hex)
	if (!h) return				// probably a sea-hex
	h.zoc = true
	if (pz) {
		for (const n of grid.neighboursAxial(h.ax))
			if (n) n.zoc = true
	}
}
// (for debugging)
export function getZOC() {
	let s = new Set()
	for (const h of map.hexMap.values()) {
		if (h.zoc) s.add(h)
	}
	return s
}

// ----------------------------------------------------------------------
const frontNat = {
	west: ["ge","fr","uk","no","dk","nl","be","lx","ir","hu"],
	east: ["po","sw","su","fi","bl"],
	med: ["it","sp","ru","tu","gr","yu","bu","gi","ml","mo","al","ts","le",
		  "pe","iq","eg","cy","li","ar","pa","tr","pl"]
}

export function front(hex) {
	const h = map.getHex(hex)
	if (!h || !h.nat) return ""
	if (h.prop && h.prop.includes('e')) return "east"
	for (const [f, n] of Object.entries(frontNat)) {
		if (n.includes(h.nat)) return f
	}
	return ""
}
