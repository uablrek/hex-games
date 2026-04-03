// SPDX-License-Identifier: CC0-1.0.
/*
  Unit demo for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import Konva from 'konva'
import {ui, unit} from 'hex-games'
import {units, unitInit} from './naw-units.js'
let board = ui.stage()

function displayUnits() {
	let x, y, p
	const dx = 60
	const dy = 60
	const ox = 100
	x = ox
	y = 100
	for (const u of units) {
		if (!('ih' in u)) continue
		if (u.nat != 'al') continue
		u.img.position({x:x, y:y})
		board.add(u.img)
		x += dx
		if (x > 660) {
			y += dy
			x = ox
		}
	}
	for (let t of [3, 5]) {
		y += dy
		x = ox
		p = 0
		for (const u of units) {
			if (!('t' in u)) continue
			if (u.t != t) continue
			if (u.nat != 'pu') continue
			if (p == 0) p = u.p
			if (p != u.p) {
				p = u.p
				y += dy
				x = ox
			}
			u.img.position({x:x, y:y})
			board.add(u.img)
			x += dx
		}
	}
	y += (dy*2)
	x = ox
	for (const u of units) {
		if (!('ih' in u)) continue
		if (u.nat != 'fr') continue
		u.img.position({x:x, y:y})
		board.add(u.img)
		x += dx
		if (x > 400) {
			y += dy
			x = ox
		}
	}
	y += dy
	x = ox
	p = 0
	for (const u of units) {
		if (!('t' in u)) continue
		if (u.nat != 'fr') continue
		if (p == 0) p = u.p
		if (p != u.p) {
			p = u.p
			y += dy
			x = ox
		}
		u.img.position({x:x, y:y})
		board.add(u.img)
		x += dx
	}
}

// ----------------------------------------------------------------------
// Main
;(async () => {
	unit.config({
		//tz: unit.side*0.32,
		//ty: unit.side*0.63,
		cornerRadius: unit.side*0.09
	})
	await unitInit()
	board.add(new Konva.Rect({
		x:0,
		y:0,
		width: 1600,
		height: 2000,
		fill: 'lightgray',
	}))
	displayUnits()
})()
