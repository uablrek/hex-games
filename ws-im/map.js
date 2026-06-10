// SPDX-License-Identifier: CC-BY-4.0.

import {grid} from '@uablrek/hex-games'
import {board, info, g} from './main.js'

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

const windArrow = new Konva.Path({
	fill: 'green',
	stroke: 'black',
	strokeWidth: 3,
	data: "m 10 0 l 5 0 l -15 -20 l -15 20 l 5 0 l 0 20 l 20 0 l z",
	position: {x:100, y:100},
	scale: {x:2.0, y:2.0},
})
export function updateWindIndicator() {
	if (!windArrow.getParent()) info.add(windArrow)
	windArrow.rotation(g.wind.d * 60)
}

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
