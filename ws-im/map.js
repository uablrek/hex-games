// SPDX-License-Identifier: CC-BY-4.0.

import {grid, map} from '@uablrek/hex-games'
import {board, g} from './main.js'

// Grid sizes
const sz = 60			// Vertical size (flattop)
const oz = sz * 0.866	// Horizontal size of one hex-column (sqrt(3)/2)
// The original map is 51x35
export let width = 52
export let height = 36
let offset = {x:0,y:0}

// The base hex-id is 4 digits XXYY, e.g. "0812". But ws&im id's are
// also accepted. They use letters A-Z,AA-ZZ for the x-coordinate,
// e.g: RR21 or A4. The ws&im coodrinates may be "offset" to allow
// larger maps than the original.

export function idToHex(id) {
	let f = id.charAt(0)
	if (f >= '0' && f <= '9') {
		// Format is XXYY
		return {x: Number(id.substring(0,2)), y: Number(id.substring(2))}
	}
	// The "id" is in ws&im hex syntax, e.g: RR21 or A4
	// So first split the string into char and integer
	let i = 1
	let c = id.charAt(i)
	if (!(c >= '0' && c <= '9')) i = 2
	let y = Number(id.substring(i))
	let x = id.charCodeAt(0)
	if (i == 1)
		// We have a single char, like "B"
		x -= 65
	else
		// We have double chars, like "BB"
		x-= 39
	return {x:x + offset.x, y:y + offset.y}
}
export function hexToId(hex) {
	// Check if the hex is within the ws&im coordinate system
	if (hex.x >= offset.x && hex.x < (offset.x + 52) &&
		hex.y >= offset.y && hex.y < (offset.y + 36)) {
		let c
		let x = hex.x - offset.x
		if (x > 25) {
			c = String.fromCharCode(x + 39)
			c = c + c
		} else
			c = String.fromCharCode(x + 65)
		return `${c}${hex.y - offset.y}`
	}
	const x = String(hex.x).padStart(2, '0')
	const y = String(hex.y).padStart(2, '0')
	return `${x}${y}`
}

// Toggle hex-id's
let hexIds
export function toggleHexId(e) {
	if (hexIds.getParent())
		hexIds.remove()
	else
		board.add(hexIds)
}
function createHexId() {
	hexIds = new Konva.Group()
	for (let x = 0; x < width; x++)
		for (let y = 0; y < height; y++) {
			const hex = {x:x,y:y}
			const pos = grid.hexToPixel(hex)
			if (pos.y < 20) continue // (outside the map)
			const txt = new Konva.Text({
				text: hexToId(hex),
				position: pos,
				fill: 'lightgray',
			})
			txt.offsetX(txt.width() / 2)
			txt.offsetY(24)
			hexIds.add(txt)
		}
	hexIds.cache()
}

export function save() {
	//https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html
	const dataURL = board.toDataURL({
		width: width * oz,
		height: height * sz,
	})
	// create link to download
	const link = document.createElement('a')
	link.download = 'ws-im-map.png'
	link.href = dataURL
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

const windIndicator = new Konva.Group()
const windArrow = new Konva.Path({
	fill: 'green',
	stroke: 'black',
	strokeWidth: 3,
	data: "m 10 0 l 5 0 l -15 -20 l -15 20 l 5 0 l 0 20 l 20 0 l z",
	scale: {x:2.0, y:2.0},
})
export function updateWindIndicator(layer) {
	if (!windIndicator.getParent()) {
		const bghex = new Konva.RegularPolygon({
			sides: 6,
			radius: 60,
			stroke: 'black',
			fill: '#449',
		})
		bghex.rotate(30)
		const vvel = new Konva.Text({
			fontSize: 16,
			align: 'center',
			fontFamily: 'sans-serif',
			fontStyle: 'bold',
			width: 200,
			x: -100,
			y: 60,
			fill: 'lightgray',
			text: "Normal Breeze",
		})
		windIndicator.add(bghex)
		windIndicator.add(windArrow)
		windIndicator.add(vvel)
		windIndicator.position({x:100, y:100})
		layer.add(windIndicator)
	}
	windArrow.rotation(g.wind.d * 60)
}

export function logHex(hd) {
	if (!hd) return
	// hd is {hex:{x:0,y:0}, d:0}
	console.log(hexToId(hd.hex), hd.d)
}
export function hexEq(h1, h2) {
	return h1.x == h2.x && h1.y == h2.y
}
function axEq(a1, a2) {
	return a1.r == a2.r && a1.q == a2.q
}
// Create a "hd-item" (hex+direction) in the form {hex:{x:0,y:0}, d:0}
export function hd(h1, h2) {
	const ax1 = grid.hexToAxial(h1) // this is the base-hex
	const ax2 = grid.hexToAxial(h2) // this is the direction-hex
	const n = grid.neighboursAxial(ax1)
	for (const [i, ax] of n.entries())
		if (axEq(ax, ax2)) return {hex:h1, d:(i + 1) % 6}
	return null					// h2 is not adjacent to h1
}
// Takes a hd-item and return the adjecent hex in direction "d"
export function adjacentHex(hd) {
	const ax = grid.hexToAxial(hd.hex)
	const n = grid.neighboursAxial(ax)
	const i = (hd.d + 5) % 6
	return grid.axialToHex(n[i])
}
// Return which side 'hex' is of a hd-item (usually a ship). The side
// can be 'l', 'r', 'b', or 's'. If 'hex' is aligned with the hd-item
// (rake), 'b' (bow) or 's' (stern) is returned. I like this since I
// finally found a use for "Cubic Coordinates", as described in:
// https://www.redblobgames.com/grids/hexagons/#coordinates-cube
export function side(hd, hex) {
	const ad = grid.hexToAxial(hd.hex)
	const ax = grid.hexToAxial(hex)
	// "cubify"
	ad.s = -ad.r - ad.q
	ax.s = -ax.r - ax.q
	switch (hd.d) {
	case 0:
		if (ax.q == ad.q) return (ax.r < ad.r) ? 'b' : 's'
		return (ax.q < ad.q) ? 'l' : 'r'
	case 3:
		if (ax.q == ad.q) return (ax.r < ad.r) ? 's' : 'b'
		return (ax.q < ad.q) ? 'r' : 'l'
	case 1:
		if (ax.s == ad.s) return (ax.r < ad.r) ? 'b' : 's'
		return (ax.s < ad.s) ? 'r' : 'l'
	case 4:
		if (ax.s == ad.s) return (ax.r < ad.r) ? 's' : 'b'
		return (ax.s < ad.s) ? 'l' : 'r'
	case 2:
		if (ax.r == ad.r) return (ax.q < ad.q) ? 's' : 'b'
		return (ax.r < ad.r) ? 'l' : 'r'
	case 5:
		if (ax.r == ad.r) return (ax.q < ad.q) ? 'b' : 's'
		return (ax.r < ad.r) ? 'r' : 'l'
	}
}

// ----------------------------------------------------------------------
// Field-of-Fire (FoF)

// To compute the field-of-fire is tricky (IMHO). I am sure there is a
// clever algorithm, but I resort to kind of brute-force. The idea is
// to divide the field-of-fire into a number of straight lines. Since
// the advanced rules put additional constraints, a Map() is returned
// that maps map-object -> v, where "v" is the number 1-5 used for
// fields in the rules.
// Note that the returned map is "set-like", and can be used in set
// operations.

// Axial neighbour offsets for flat-top, up=0
const dOffset = [
	{r:-1, q:0},
	{r:-1, q:1},
	{r:0, q:1},
	{r:1, q:0},
	{r:1, q:-1},
	{r:0, q:-1},
]
// The next hex in direction 'd'
function nextAx(ax, d) {
	const offset = dOffset[d]
	return {r:ax.r + offset.r, q:ax.q + offset.q}
}
// Return an array of hexes (map-object) in the straight line: "steps"
// from hex "ax" in direction "d" (0-5 in the ws&im "standard", e.g
// flat-top, up=0).  The base-hex (ax) is *NOT* included.
function lineDir(ax, d, steps) {
	const s = []
	const offset = dOffset[d]
	while (steps--) {
		ax = {r:ax.r + offset.r, q:ax.q + offset.q}
		const h = map.getAxial(ax)
		if (h) s.push(h)		// (may be out-of-map)
	}
	return s
}
// Translate a direction relative to a ship to real direction.
// d=0 is ahead, d=3 is back. Port directions are negative (-1, -2)
function realDir(hd, d) {
	// (d may be negative)
	return (d + hd.d + 6) % 6
}

function bowLine(axd, sign) {
	return lineDir(axd.hex, realDir(axd, 1*sign), 10)
}
function sternLine(axd, sign) {
	const stern = nextAx(axd.hex, realDir(axd, 3))
	return lineDir(stern, realDir(axd, 2*sign), 10)
}
function fofBaseI(axd, i, b, sign, fof) {
	let l, th
	switch (i) {
	case 0:
		l = lineDir(b, realDir(axd, 1*sign), 3)
		for (const h of l) fof.set(h, 3)
		if (l.length == 3) {	// (in map?)
			l = lineDir(l[2].ax, realDir(axd, 1*sign), 6)
			for (const h of l) fof.set(h, 5)
		}
		l = lineDir(b, realDir(axd, 2*sign), 3)
		for (const h of l) fof.set(h, 2)
		if (l.length == 3) {
			l = lineDir(l[2].ax, realDir(axd, 2*sign), 6)
			for (const h of l) fof.set(h, 4)
		}
		break
	case 1:
		l = lineDir(b, realDir(axd, 1*sign), 5)
		for (const h of l) fof.set(h, 3)
		if (l.length == 5) {
			l = lineDir(l[4].ax, realDir(axd, 1*sign), 2)
			for (const h of l) fof.set(h, 5)
		}
		l = lineDir(b, realDir(axd, 2*sign), 5)
		for (const h of l) fof.set(h, 2)
		if (l.length == 5) {
			l = lineDir(l[4].ax, realDir(axd, 2*sign), 2)
			for (const h of l) fof.set(h, 4)
		}
		break
	case 2:
		l = lineDir(b, realDir(axd, 1*sign), 5)
		for (const h of l) fof.set(h, 3)
		l = lineDir(b, realDir(axd, 2*sign), 5)
		for (const h of l) fof.set(h, 2)
		break
	case 3:
		l = lineDir(b, realDir(axd, 1*sign), 3)
		for (const h of l) fof.set(h, 3)
		l = lineDir(b, realDir(axd, 2*sign), 3)
		for (const h of l) fof.set(h, 2)
		break
	case 4:
		l = lineDir(b, realDir(axd, 1*sign), 1)
		for (const h of l) fof.set(h, 3)
		l = lineDir(b, realDir(axd, 2*sign), 1)
		for (const h of l) fof.set(h, 2)
		break
	}
}
function fofBase(axd, sign, fof) {
	let b = nextAx(axd.hex, realDir(axd, 2*sign))
	for (let i = 0; i < 5; i++) {
		const h = map.getAxial(b)
		if (!h) return // out-of-map
		fof.set(h, 1)
		fofBaseI(axd, i, b, sign, fof)
		const th = nextAx(b, realDir(axd, 2*sign))
		b = nextAx(th, realDir(axd, 1*sign))
	}
}
// Returns {starboard:Map(), port:Map()}
export function fireHexes(hd) {
	if (!hd.hex) return null	// (un-placed ship)
	const rc = {r: new Map(), l: new Map()}
	const axd = {hex: grid.hexToAxial(hd.hex), d: hd.d}
	for (const side of ["l", "r"]) {
		// The lines from bow/stern hexes
		const sign = side == "l" ? -1 : 1
		for (const h of bowLine(axd, sign)) rc[side].set(h, 5)
		for (const h of sternLine(axd, sign)) rc[side].set(h, 4)
		// The rest of the FoF is computed from the "base-hexes",
		// which are the hexes orthogonal to the ship, noted "1" in
		// the rules.
		fofBase(axd, sign, rc[side])
	}
	return rc
}

// ----------------------------------------------------------------------
// Init

// Re-export some items
export const hex = map.getHex
export const ax = map.getAxial
export const hexMap = map.hexMap

function focus(hexid) {
	if (!hexid) return
	const pos = grid.hexToPixel(idToHex(hexid))
	// We want to adjust the board position so that the focus-hex is
	// in the center
	const centerX = window.innerWidth / 2
	const centerY = window.innerHeight / 2
	board.position({x:centerX - pos.x, y:centerY - pos.y})
}

export async function init(obj) {
	const cfg = {
		height: 36,
		width: 52,
		offset: {x:0,y:0},
		focus: "",
	}
	for (const prop in obj) if (prop in cfg) cfg[prop] = obj[prop]

	height = cfg.height
	width = cfg.width
	offset = cfg.offset
	grid.configure(sz, 1.0, {x:0,y:0}, true)
	// TODO: add wave glimmer
	map.init(cfg)

	const sea = new Konva.Rect({
		width: width * oz,
		height: height * sz,
		fill: '#2030aa',
	})
	board.add(sea)
	const pattern = new Image()
	pattern.src = grid.patternSvg("black")
	await new Promise(resolve => pattern.onload = resolve)
	const hexGrid =  new Konva.Rect({
		width: width * oz,
		height: height * sz,
		fillPatternImage: pattern,
		fillPatternRepeat: 'repeat',
		fillPatternScale: grid.patternScale(),
	})
	hexGrid.cache()
	createHexId()
	board.add(hexGrid)
	focus(cfg.focus) 
}
