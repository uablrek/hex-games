// SPDX-License-Identifier: CC-BY-4.0.
// (hix = Hex Index)

import Konva from 'konva'
import {ui, grid, lsave} from '@uablrek/hex-games'
import * as map from './map.js'
import * as ship from './ship.js'
import hixData from './solo.json'

export const board = ui.stage()
export const info = new Konva.Layer({name: "info"})
export const g = {}
export const sc = {}
const ships = [
	{cid:"br-sol2-64", name:"Template", ih:{hex:"0806", d:1}},
	{cid:"br-sol2-64", name:"Dir 3", ih:{hex:"2007", d:3}},
	{cid:"br-sol2-64", name:"Dir 4", ih:{hex:"3207", d:4}},
	{cid:"br-sol2-64", name:"Dir 6", ih:{hex:"0818", d:6}},
]
let mode = ''
let hix = 0
let hixGroup
let hixArray
let hixMap

ui.setKeys([
	{key:'c', fn:keyClear},
	{key:'s', fn:keySave},
	{key:'l', fn:keyLine},
	{key:'z', fn:keyZone},
])
function keyClear(e) {
	mode = "enter"
	hix = 1
	if (hixGroup) hixGroup.destroy()
	hixGroup = new Konva.Group()
	board.add(hixGroup)
	hixArray = []
	console.log("mode", mode)
}
function keySave(e) {
	if (mode != "enter") return
	mode = "saved"
	lsave.saveJSON(hixArray, "solo.json")
}
function keyLine(e) {
	mode = "line"
}
function keyZone(e) {
	mode = "zone"
}


const hixTemplate = new Konva.Text({
	text: "0",
	font: 'sans-serif',
	fontSize: 20,
	fill: 'white',
	fontStyle: 'bold',
	offset: {x:10, y:10},
})

function boardOnClick(e) {
	const _pos = board.getRelativePointerPosition()
	const hex = grid.pixelToHex(_pos)
	const pos = grid.hexToPixel(hex)
	const ax = grid.hexToAxial(hex)
	const center = grid.hexToAxial({x:8,y:6})
	if (mode == "enter") {
		const rax = {r:ax.r - center.r, q:ax.q - center.q}
		hixGroup.add(hixTemplate.clone({
			text: `${hix}`,
			position: pos,
		}))
		hixArray.push([rax.q + 1000*rax.r, hix])
		hix++
		return
	}
	if (mode == "line") {
		const hexes = getLine({x:8,y:6}, hex)
		markHexes(hexes)
		return
	}
	if (mode == "zone") {
		const s = ships[2]
		if (hexMarkers) hexMarkers.destroy()
		const rhex = rotate(s.hex, s.d, hex)
		let angle = getAngle(grid.hexToPixel(rhex))
		// Our coordinate system points upwards
		angle = (angle + 270) % 360
		const ad = Math.floor(angle / 60)     // relative direction to 'as'
		console.log("rhex", rhex, "angle", angle, "zone", Z)
	}
}
// https://www.redblobgames.com/grids/hexagons/#line-drawing
function getLine(from, to) {
	const s = new Set()
	const fax = grid.hexToAxial(from)
	const tax = grid.hexToAxial(to)
	const hdist = grid.axialDistance(fax, tax)
	const fpx = grid.hexToPixel(from)
	// displace a little bit (makes vertical lines work)
	fpx.y = fpx.y + 0.1
	fpx.x = fpx.x + 0.1
	const tpx = grid.hexToPixel(to)
	const dx = tpx.x - fpx.x
	const dy = tpx.y - fpx.y
	const k = dy/dx
	console.log(hdist, dx, dy)
	for (let i = 0; i <= hdist; i++) {
		const rex = i*dx/hdist
		const rey = rex*k
		const pos = {x:fpx.x + rex, y:fpx.y + rey}
		const hex = grid.pixelToHex(pos)
		s.add(hex)
	}
	return s
}
const markerTemplate = new Konva.Circle({
	radius: 10,
	stroke: 'gray',
	fill: 'red',
})
let hexMarkers
function markHexes(hexes) {
	if (hexMarkers) hexMarkers.destroy()
	if (!hexes) return
	hexMarkers = new Konva.Group()
	for (const hex of hexes) {
		const pos = grid.hexToPixel(hex)
		hexMarkers.add(markerTemplate.clone({
			position: pos,
		}))
	}
	board.add(hexMarkers)
}

function addHix(s) {
	const g = new Konva.Group()
	const cax = grid.hexToAxial(s.hex)
	const close = grid.inRangeAxial(5, cax)
	for (const aax of close) {
		let rax = {r:aax.r - cax.r, q:aax.q - cax.q}
		// Rotate
		// https://www.redblobgames.com/grids/hexagons/#rotation
		rax.s = -rax.r - rax.q	// cubify
		for (let i = 0; i < s.d; i++) {
			// [q,r,s] -> [-r,-s,-q]
			rax = {q: -rax.s, r:-rax.q, s:-rax.r}
		}
		const key = rax.r*1000 + rax.q
		const v = hixMap.get(key)
		if (v) {
			const pos = grid.hexToPixel(grid.axialToHex(aax))
			g.add(hixTemplate.clone({
				text: `${v}`,
				position: pos,
			}))
		}
	}
	board.add(g)
}
// Return the angle (0 <= angle < 360) in degrees from origo to point p.
// This is half of polar coordinates. We don't care about distance.
// (this specific for pixles where the y-axis grows downwards)
function getAngle(p) {
	if (p.x == 0) return (p.y <= 0) ? 0 : 180
	let a = Math.atan(-p.y / p.x) / Math.PI * 180
	// 'a' is within +-90, which is ok for dp.x>0
	if (p.x < 0) a += 180
	return (a + 360) % 360		// normalize to > 0
}
// Return the relative coordinates of hex when rotaded 'd' steps
// around the center hex 'chex'
// https://www.redblobgames.com/grids/hexagons/#rotation
function rotate(chex, d, hex) {
	const cax = grid.hexToAxial(chex)
	const ax = grid.hexToAxial(hex)
	let rax = {r:ax.r - cax.r, q:ax.q - cax.q} // relative to cax
	rax.s = -rax.r - rax.q	// cubify
	for (let i = 0; i < d; i++) {
		// [q,r,s] -> [-r,-s,-q]
		rax = {q: -rax.s, r:-rax.q, s:-rax.r}
	}
	return grid.axialToHex(rax)
}

// ----------------------------------------------------------------------
// Main

;(async () => {
	await map.init(sc.map)
	await ship.init(ships)
	for (const s of ships) {
		ship.place(s, s.ih)
	}
	board.on('click', boardOnClick)
	hixMap = new Map(hixData)
	for (let i = 1; i < ships.length; i++)
		addHix(ships[i])
})()
