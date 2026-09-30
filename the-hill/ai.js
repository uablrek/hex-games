// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the AI module for:
  https://github.com/uablrek/hex-games/tree/main/the-hill

  This is a extremely simple AI:
  - It can only play English (since there is no combat support)
  - It never attacks
  - It tries to keep the objective hexes occupied

  Well, that's it.

  To attract units to the objective hexes an "influence" map is used.
  Hexes are assigned a weight value that is higher nearer the
  objective hexes. Units are is moved to the hex with the highest
  gravity within reach.
*/

import {grid, unit, sequence, map, server} from '@uablrek/hex-games'
import {moveUnit, g} from './main.js'
const log = console.log
const dbg = function(){}
export let me = ''
export let busy = false

// Play as the active player
export function play() {
	busy = true
	switch (g.phase) {
	case "English Deployment":
		deployEnglish()
		break
	case "French Deployment":
		deployFrench()
		break
	case "Movement":
		move(0)
		break
	default:
		busy = false
		sequence.nextStep()
	}	
}

function deployFrench() {
	if (g.unitBox) g.unitBox.destroy()
	// Place french units in hexes with prop 'a', and with high weights.
	const dh = []		// Deployment hexes
	for (const h of map.hexMap.values())
		if (h.prop && h.prop.includes('a')) dh.push(h)
	shuffle(dh)
	const dunits = []
	for (const u of g.units)
		if (!u.hex && u.nat == "fr") dunits.push(u)
	shuffle(dunits)
	// Place artillery first
	for (const u of dunits) {
		if (u.type != "art") continue
		const h = highestWeight(dh)
		unit.place({i:u.i, hex:h.hex}, g.board)
	}
	for (const u of dunits) {
		if (u.type == "art") continue
		const h = highestWeight(dh)
		unit.place({i:u.i, hex:h.hex}, g.board)
	}
	busy = false
	sequence.nextStep()
}
function deployEnglish() {
	if (g.unitBox) g.unitBox.destroy()
	// Deploy all units randomly, no more than 3 hexes from an
	// objective hex
	let h = g.objectives[0]
	const t = Array.from(grid.inRangeAxial(3, h.ax).values())
	for (const u of g.units) {
		if (u.hex) continue
		if (u.nat != "en") continue
		h = t[Math.floor(Math.random() * t.length)]
		while (h.units.size > 1)
			h = t[Math.floor(Math.random() * t.length)]
		unit.place({i:u.i, hex:h.hex}, g.board)
	}
	busy = false
	sequence.nextStep()
}

let ua = []
function move(i) {
	if (i == 0) {
		// Get all units in an array, and shuffle it
		ua = []
		for (const u of g.units) {
			if (!u.hex) continue
			if (u.nat != g.nat) continue
			ua.push(u)
		}
		shuffle(ua)
	}
	if (i >= ua.length) {
		// All units moved, proceed
		ua = []
		busy = false
		sequence.nextStep()
		return
	}
	const u = ua[i]
	if (!u.ohex) {
		let th = toHex(u)
		if (th) {
			moveUnit(u, th)			// (in main.js)
			setTimeout(move, 600, i+1)
			return
		}
	}
	move(i+1)					// tail-recursive
}
function shuffle(a) {
	let c = a.length * 2
	while (c--) {
		const i1 = Math.floor(Math.random() * a.length)
		const i2 = Math.floor(Math.random() * a.length)
		const t = a[i1]
		a[i1] = a[i2]
		a[i2] = t
	}
}
// Use the weights to find a hex with better weight for a unit
function toHex(u) {
	const h = map.getHex(u.hex)
	const ta = grid.movementAxial(u.m, h.ax, u)
	let th = h
	for (const n of ta.values())
		if (n.weight > th.weight) th = n
	return th == h ? null : th
}
// Find a free hex with the highest weight in a Set() of map objects
function highestWeight(s) {
	let th = null
	for (const h of s.values()) {
		// Don't overstack
		if (h.units && h.units.size > 1) continue
		if (!th) {
			th = h
			continue
		}
		if (h.weight > th.weight) th = h
	}
	return th
}

// Assign weight values to hexes centered around 'hex' at max
// distance 'N'.
// Prerequisite: the map is initiated, and all map-objects has '.weight',
//   and grid.mapFunctions() is called (with at least 'getAxial').
function assignWeight(hex, N, weightFn) {
	if (!weightFn) weightFn = function(d, N) {
		const w = N + 1 - d
		return w < 0 ? 0 : w
	}
	const h = map.getHex(hex)
	const s = grid.inRangeAxial(N, h.ax)
	for (const n of s.values()) {
		const d = grid.axialDistance(h.ax, n.ax)
		n.weight += weightFn(d, N)
	}
}

export function player(p) {
	// "English" is default
	me = (p == "French" ? "French" : "English")
}
export function init() {
	// Assign weights to objective hexes
	for (const h of map.hexMap.values())
		h.weight = 0
	for (const o of g.objectives)
		assignWeight(o.hex, 15)
	// Boost the object closest to the French
	assignWeight({x:4,y:9}, 1)
}
