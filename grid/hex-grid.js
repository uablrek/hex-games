// SPDX-License-Identifier: CC0-1.0.
/*
  A hex-grid library.
  https://github.com/uablrek/hex-games

  The pattern image problem:

  We use an Image as fillPattern in a Konva.Rect. I can't see a way to
  use a Konva.Shape for instance, so I assume we *must* use an
  Image. An SVG image is used, so the dimensions can be any floating
  point number (S=scalable). But the Image size is rounded to an
  integer.

  The pattern size really *must* be floats to make it possible to
  align the grid with an existing map that has it's own dimensions.

  The current approach is to round the dimensions and hope that it's
  good enough. If not, it seems to be possible to use
  "fillPatternScale" in Konva to make a tiny adjustment to complensate
  for the rounding error.
*/

// The grid is assumed to be "compatible" with "hex.py", so --size
// differs from "size" on https://www.redblobgames.com 
var hsize = 50				// Width for pointy, height for flat (--size)
var hscale = 1.0			// --scale to hex.py
// The image size is rounded to nearest integer
var osize = Math.round(hsize * hscale * Math.sqrt(3))
var odist = osize / 2
var gridOffset = {x:0, y:0}
var flattop = false

export function configure(
	size, scale = 1.0, offset = {x:0, y:0}, _flattop = false) {
	hsize = Math.round(size)
	hscale = scale
	gridOffset = offset
	flattop = _flattop
	// (use non-rounded size here)
	osize = Math.round(size * scale * Math.sqrt(3))
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
