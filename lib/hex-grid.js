// SPDX-License-Identifier: CC0-1.0.
/*
  A hex-grid library.
  https://github.com/uablrek/hex-games

  The pattern image problem:

  We use an Image as fillPattern in a Konva.Rect. I can't see a way to
  use a Konva.Shape for instance, so I assume we *must* use an
  Image. An SVG image is used, so the dimensions can be any floating
  point number (S=scalable). But the Image dimensions are rounded to
  integers.

  The pattern size really *must* be floats to make it possible to
  align the grid with an existing map that has it's own dimensions.

  It is fortunately possible to use "fillPatternScale" in Konva to
  make a tiny adjustment to complensate for the rounding error. For
  example: width=86.7 would be rounded to 87, but a scaleX=0.995 would
  bring it back. So, *always* set:

  fillPatternScale: hex.patternScale(),
*/

// The grid is assumed to be "compatible" with "hex.py", so --size
// differs from "size" on https://www.redblobgames.com 
var hsize = 50				// Width for pointy, height for flat (--size)
var hscale = 1.0			// --scale to hex.py
// The image size is rounded to nearest integer
var osize = hsize * hscale * Math.sqrt(3)
var odist = osize / 2
var gridOffset = {x:0, y:0}
var flattop = false

export function configure(
	size, scale = 1.0, offset = {x:0, y:0}, _flattop = false) {
	hsize = size
	hscale = scale
	gridOffset = offset
	flattop = _flattop
	osize = size * scale * Math.sqrt(3)
	odist = osize / 2

	if (flattop) {
		pixelToHex = flatPixelToHex
		hexToPixel = flatHexToPixel
		hexToAxial = flatHexToAxial
		axialToHex = flatAxialToHex
	} else {
		pixelToHex = pointyPixelToHex
		hexToPixel = pointyHexToPixel
		hexToAxial = pointyHexToAxial
		axialToHex = pointyAxialToHex
	}
}

export var pixelToHex = pointyPixelToHex
export var hexToPixel = pointyHexToPixel
export var hexToAxial = pointyHexToAxial
export var axialToHex = pointyAxialToHex

// About pixel<>hex conversion:
// The functions on https://www.redblobgames.com/ did not work
// out-of-the-box, and honestly I did not understand them, so I
// coudn't fix it. The functions below uses offset coordinates, and
// are NOT perfect. A click near the edge of a hex *may* select an
// adjacent hex. But for practical use, they are good enough. They
// also takes "scale" into account.

function pointyPixelToHex(pos) {
	// Adjust for grid/map offset
	pos = {x:pos.x + gridOffset.x, y:pos.y + gridOffset.y}
	let x, y = Math.round((pos.y / odist) - 0.42) // 0.42 ~= 5/12
	if (y % 2 == 0) {
		x = Math.round(pos.x / hsize)
	} else {
		x = Math.round(pos.x / hsize - 0.5)
	}
	return({x:x, y:y});
}
function pointyHexToPixel(hex) {
	let x, y = Math.round(hex.y * odist + odist/3)
	if (hex.y % 2 == 0) {
		x = Math.round(hex.x * hsize)
	} else {
		x = Math.round(hex.x * hsize + (hsize/2))
	}
	// Adjust for grid/map offset
	return({x:x - gridOffset.x, y:y - gridOffset.y});
}
function pointyHexToAxial(hex) {
	let q
	if (hex.y % 2 == 0) {
		q =  hex.x - hex.y / 2
	} else {
		q = hex.x - (hex.y - 1) / 2
	}
	return {q: q, r: hex.y}
}
export function pointyAxialToHex(ax) {
	let x
	if (ax.r % 2 == 0) {
		x = ax.q + ax.r / 2
	} else {
		x = ax.q + (ax.r - 1) / 2
	}
	return {x:x, y: ax.r}
}
// flattop
function flatPixelToHex(pos) {
	// Adjust for grid/map offset
	pos = {x:pos.x + gridOffset.x, y:pos.y + gridOffset.y}
	let y, x = Math.round(pos.x / odist - 0.42) // 0.42 ~= 5/12
	if (x % 2 == 0) {
		y = Math.round(pos.y / hsize)
	} else {
		y = Math.round(pos.y / hsize - 0.5)
	}
	return({x:x, y:y});
}
function flatHexToPixel(hex) {
	let y, x = Math.round(hex.x * odist + odist/3)
	if (hex.x % 2 == 0) {
		y = Math.round(hex.y * hsize)
	} else {
		y = Math.round(hex.y * hsize + (hsize/2))
	}
	// Adjust for grid/map offset
	return({x:x - gridOffset.x, y:y - gridOffset.y});
}
function flatHexToAxial(hex) {
	let r
	if (hex.x % 2 == 0) {
		r =  hex.y - hex.x / 2
	} else {
		r = hex.y - (hex.x - 1) / 2
	}
	return {q:hex.x, r: r}
}
export function flatAxialToHex(ax) {
	let y
	if (ax.q % 2 == 0) {
		y = ax.r + ax.q / 2
	} else {
		y = ax.r + (ax.q - 1) / 2
	}
	return {x:ax.q, y: y}
}

export function patternSvg() {
	let d = osize
	let s2 = (hsize / 2).toFixed(4)
	let d3 = (d / 3).toFixed(4)
	let d6 = (d / 6).toFixed(4)
	let p, pw, ph
	if (flattop) {
		p = `m 0 ${s2} l ${d3} 0 l ${d6} -${s2} l ${d3} 0 l ${d6} ${s2} l -${d6} ${s2} l -${d3} 0 l -${d6} -${s2}`
		pw = d.toFixed(4)
		ph = hsize
	} else {
		pw = hsize
		ph = d.toFixed(4)
		p = `m ${s2} 0 l 0 ${d3} l -${s2} ${d6} l 0 ${d3} l ${s2} ${d6} l ${s2} -${d6} l 0 -${d3} l -${s2} -${d6}`
	}
	return `data:image\/svg+xml,<svg width="${pw}" height="${ph}" viewBox="0 0 ${pw} ${ph}" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="black" stroke-width="1" d="${p}" /></svg>`
}

export function patternScale() {
	let h = hsize / Math.round(hsize)
	let o = osize / Math.round(osize)
	if (flattop) return {x:o, y:h}
	return {x:h, y:o}
}


// ----------------------------------------------------------------------
// Distance/movement functions
// These are likely connected to the map, so you would want them to
// return map-hex-objects rather than coordinates. You *could* do it
// in the calling function, but defining functions is supported:
export function mapFunctions(
	_getAxial, _blocked, _getMovementCost, _removeD) {
	getAxial = _getAxial
	if (_blocked) blocked = _blocked
	if (_getMovementCost) getMovementCost = _getMovementCost
}
// Returns a map-hex object from an axial coordinate
let getAxial = (ax) => ax
// Returns true if movement to 'h' over edge 'i' is blocked
let blocked = (me, h, i) => false

// The groundMovementAxial() uses .d to mark already-visited hexes
let removeD = () => undefined
let getMovementCost = (me,n,i) => 1

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
// (order is important for blocked())
const neighbourOffset = [
	{r:-1, q:1},
	{r:0, q:1},
	{r:1, q:0},
	{r:1, q:-1},
	{r:0, q:-1},
	{r:-1, q:0},
]
// The function will always return 6 objects, but blocked will be 'undefined'
export function neighboursAxial(ax) {
	let n = []
	let me = getAxial(ax)
	if (!me) return n
	for (const [i, o] of neighbourOffset.entries()) {
		let h = getAxial({r:ax.r+o.r, q:ax.q+o.q})
		if (!h || blocked(me, h, i)) {
			n.push(undefined)
		} else
			n.push(h)
	}
	return n
}

// A map is needed!
// Return a set of reachable map-hex-objects. The map-hex-objects
// *MUST* have a .ax field! The function will use .d in the
// map-hex-objects to mark already-visited hexes, so "removeD()"
// must be defined by the caller.
export function movementAxial(N, ax) {
	removeD()					// remove .d in all reachable map-hex-objects
	let me = getAxial(ax)
	let s = new Set()
	crawl(N, me, s)
	s.delete(me)				// exclude my own hex
	return s
}
function crawl(N, h, s) {
	if (N < 0) return
	h.d = N 					// Movement-points left
	s.add(h)
	if (N == 0) return
	let neighbours = neighboursAxial(h.ax)
	for (const [i, n] of neighbours.entries()) {
		if (!n) continue		// unreachable neighbour
		if (Object.hasOwn(n, 'd') && n.d > N) continue
		let cost = getMovementCost(h, n, i)
		crawl(N-cost, n, s)
	}
}
