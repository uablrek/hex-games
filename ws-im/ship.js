// SPDX-License-Identifier: CC-BY-4.0.

import Konva from 'konva'
import {grid, die} from '@uablrek/hex-games'
import * as map from './map.js'
import {board, sc, g} from './main.js'
import {shipClasses} from './tables.js'
import solData from './sol.svg'
import fData from './f.svg'
import brflagData from './gb.svg'
import frflagData from './fr.svg'
import spflagData from './es.svg'
import seflagData from './se.svg'
import usflagData from './us.svg'
import ruflagData from './ru.svg'
import tuflagData from './tu.svg'
import dkflagData from './dk.svg'
import duflagData from './nl.svg'
import piflagData from './Jolly-Roger.svg'
import fullSailsData from './full-sails.svg'

const shipImage = {}
const flagImage = {}
const shipClass = new Map()
let scale = 1.0
let ships
let classData

export function fromImg(img) {
	// Since s.img is a Konva.Group, the clicked item may be anything in it
	let g = img.findAncestor('Group', true)
	i = Number(g.id().substring(4))
    return ships[i]
}

const markerTemplate = new Konva.Rect({
	height: 115,
	width: 60,
	stroke: "gold",
	strokeWidth: 3,
	offsetX: 26,
	offsetY: 28,
	cornerRadius: 3,
})
export function mark(s, map) {
	const pos = grid.hexToPixel({x:s.hex.x, y:s.hex.y})
	s.mark = markerTemplate.clone({
		position: pos,
	})
	s.mark.rotation(s.d * 60)
	map.add(s.mark)
}
export function unmark(s) {
	if (s.mark) {
		s.mark.destroy()
		s.mark = null
	}
}
// Simplified! Will likely move to 'main.js'
function willSurrender(s) {
	if (s.s.hull <= 0) return true
	if (s.s.guns.l == 0 && s.s.guns.r == 0) return true
	let surrendered = true
	for (const v of s.s.crew) if (v) surrendered = false
	if (surrendered) return true
	for (const v of s.s.rigg) if (v) return false
	return true
}
const surrenderTemplate = new Konva.Path({
	data: "M 0 0 L 40 70 M 40 0 L 0 70",
	stroke: 'gray',
	strokeWidth: 6,
	offsetX: 20,
})
export function checkSurrender(s) {
	if (s.surrendered) return true // once is enough
	if (!willSurrender(s)) return
	fullSails(s, false)
	s.surrendered = true
	s.img.add(surrenderTemplate.clone())
	s.img.cache()
}

let fullSailsTemplate			// A Konva.Image. Defined in "main"
export function fullSails(s, set) {
	s.fullSails = set
	const fsImage = s.img.findOne(".fullsails")
	if (set) {
		if (fsImage) return		// already set (don't re-cache)
		const fsails = fullSailsTemplate.clone({
			scale: {x:0.1, y:0.1},
			position: {x:-20, y:20},
			name: "fullsails",
		})
		s.img.add(fsails)
	} else {
		if (!fsImage) return	// not set (don't re-cache)
		fsImage.destroy()
	}
	s.img.cache()
}
export function place(s, ih) {
	if (!ih) return
	const hex = map.idToHex(ih.hex)
	s.hex = hex					// always {x,y}
	s.d = s.ih.d - 1			// internal representation 0-5
	if (s.ih.fullSails) fullSails(s, s.ih.fullSails)
	s.img.position(grid.hexToPixel(hex))
	s.img.rotation(s.d * 60)
	board.add(s.img)
}
const mAspect = {
	b3: {
		A: 3,
		B: 2,
		C: 1,
		D: 0,
	},
	b4: {
		A: 4,
		B: 3,
		C: 1,
		D: 0,
	},
	f5: {
		A: 5,
		B: 4,
		C: 2,
		D: 0,
	},
	f6: {
		A: 6,
		B: 5,
		C: 2,
		D: 0,
	},
	f7: {
		A: 7,
		B: 6,
		C: 2,
		D: 0,
	},
	FD: {						// Flying Dutchman
		A: 7,
		B: 7,
		C: 7,
		D: 7,
	},
}
function defineMovementAllowance(s) {
	switch (s.class) {
	case "SOL1":
		s.mov = {
			turn: 1,
			battle: mAspect.b3,
			full: mAspect.f5,
		}
		break
	case "SOL2":
		s.mov = {
			turn: 2,
			battle: mAspect.b3,
			full: mAspect.f5,
		}
		break
	case "F3":
		s.mov = {
			turn: 3,
			battle: mAspect.b4,
			full: mAspect.f6,
		}
		break
	case "F4":
		s.mov = {
			turn: 3,
			battle: mAspect.b4,
			full: mAspect.f7,
		}
		break
	}
}
// Return {mp:, t:} with respect to wind, full-sails and
// previous movement. The relevant rule sections are 7.1.12-7.1.16.
// If either m or t is negative, the move order is invalid
export function mp(s) {
	const fail = {mp:-1,t:-1}
	let maspect = s.fullSails ? s.mov.full : s.mov.battle
	if (s.s.rigg[0] == 0) {
		// We have lost one or more rigging sections
		s.dismasted = true
		let loss = 0
		for (let sect of s.s.rigg) {
			if (sect == 0)
				loss++
			else
				s.dismasted = false
		}
		maclone = {}
		for (const d of ['A', 'B', 'C', 'D'])
			maclone[d] = maspect[d] - loss
		maspect = maclone
	}
	if (s.dismasted) {
		// May only drift and turn according to rule 8.2.5
		// TODO: implement!
		return fail
	}
	// The initial direction 
	let a = aspectMatrix[g.wind.d][s.d]
	const maxmp = maspect[a]	// initial dir mp may never be exceeded
	// Handle the special case (rule 7.1.15) when a ship starts with
	// mp=0 (or <0), against the wind (D), or due to rigging section
	// loss
	if (maxmp <= 0) {
		if (!s.m) return {mp:0, t:1}
		if (s.m.length > 1) return fail
		const c = s.m.charAt(0)
		if (c == 'L' || c == 'R')
			return {mp:0,t:0}
		else
			return fail
	}
	// no movement orders
	if (!s.m) return {mp: maxmp, t: s.mov.turn}
	if (s.m.length > maxmp) return fail
	// The ship has movement orders, but may still move. Now it
	// becomes complicated!
	let t = s.mov.turn
	let m = maxmp
	let d = s.d
	for (let i = 0; i < s.m.length; i++) {
		//console.log("loop", i, {mp:m, t: t})
		// we still have movement orders, but have we any mp's left?
		if (m < 0 || t < 0) return fail
		if (m == 0 && t == 0) return fail
		// we have at least one t, or one mp left
		const c = s.m.charAt(i)
		if (c == '1' || c == 'B') {
			m--
		} else {
			if (t == 0) return fail
			t--
			m--
			if (i > 0) {
				const p = s.m.charAt(i-1)
				if (p != '1') return fail // must move between turns
			}
			if (c == 'L')
				d = (d + 5) % 6
			else
				d = (d + 1) % 6
			// We have a new wind aspect, which will alter mp's.
			a = aspectMatrix[g.wind.d][d]
			const mnew = maspect[a]
			if (mnew <= m) {
				// We may not exceed the new mp limit
				m = mnew
			} else if ((maxmp-i-1) > m) {
				// We may turn back to a better aspect
				m = maxmp-i-1
			}
		}
	}
	return {mp:m, t: t}
}
const aspectMatrix = [
	['B','A','C','D','C','A'],
	['A','B','A','C','D','C'],
	['C','A','B','A','C','D'],
	['D','C','A','B','A','B'],
	['C','D','C','A','B','A'],
	['A','C','D','C','A','B'],
]
export function moveAll(i) {
	for (const s of ships) moveShip(s, i)
}
function moveShip(s, i) {
	if (!s.hex) return			// not on the map
	const c = s.m.charAt(i)
	if (!c) return
	if (c == 'B') return
	if (c == '1') {
		const h = map.adjacentHex(s)
		const pos = grid.hexToPixel(h)
		const tween = new Konva.Tween({
			node: s.img,
			x: pos.x,
			y: pos.y,
			duration: 0.5,
			easing: Konva.Easings.EaseInOut,
			onFinish: () => tween.destroy(),
		})
		tween.play()
		s.hex = h
	} else {
		// Problem: if we for instance make a left-turn from d=0 to
		// d=5, the rotation becomes +300, which look... funny (not).
		// Instead we want a -60 turn in this case, so 0 -> -60
		s.img.rotation(s.d * 60) // the same, but positive
		const dd = c == 'L' ? -1 : 1
		const rot = s.img.rotation() + (60 * dd)
		const tween = new Konva.Tween({
			node: s.img,
			rotation: rot,
			duration: 0.5,
			easing: Konva.Easings.EaseInOut,
			onFinish: () => tween.destroy(),
		})
		tween.play()
		s.d = (s.d + dd + 6) % 6
	}
}
// Check collision in movement step i. Rule 8.3.
// If two ships occupy the same hex (the collision-hex) after
// 'step', a collision has occured. Only one ship may occupy the
// collision-hex, and the other will have it's move-step cancelled.
// Both ships must stop, and may not make any more moves this turn.
//
// This function must be called repeatedly until no collision occur
// (return null). This will cover "cascading" collisions, in a
// line-of-ships for instance.
//
// Returns a "hd-item" {hex:{x:0,y:0}, d:0}. "hex" is the
// collision-hex, and "d" is the direction to the other ship.
//
// NOTE: All edges of the map is treated as land, and will cause a
// collision!
export function collisionCheck(step) {
	// Make a "fake" movement up to and including 'step'. We can
	// assume that all collisions has been taken care of for previous
	// steps.
	function cloneHd(hd) {return {hex:hd.hex, d:hd.d}}
	for (const s of ships) if (s.hex) s.th = cloneHd(s)
	for (let i = 0; i <= step; i++) {
		for (const s of ships) {
			if (!s.hex) continue
			s.ph = cloneHd(s.th)		// previous hex
			const c = s.m.charAt(i)
			if (!c) continue
			switch (c) {
			case 'B':
				break
			case '1':
				s.th.hex = map.adjacentHex(s.th)
				break
			case 'L':
				s.th.d = (s.th.d + 5) % 6
				break
			case 'R':
				s.th.d = (s.th.d + 1) % 6
				break
			}
		}
	}
	// Check if any ship is moving out of the map
	for (const s of ships) {
		if (!s.hex) continue
		if (!map.hex(s.th.hex)) {
			s.m = s.m.substring(0, step)
			return map.hd(s.ph.hex, s.th.hex)
		}
		const st = stern(s.th)
		if (!map.hex(st)) {
			s.m = s.m.substring(0, step)
			return map.hd(stern(s.ph), st)
		}
	}
	// Check if two ships occupies the same hex: a collision-hex (chex).
	// A Set is used, but we can't compare objects, so use a key
	function key(h) {return h.x + 1000 * h.y}
	let chex = null
	const ohexes = new Set()	// occupied hexes
	let s1, s2
	for (const s of ships) {
		if (!s.hex) continue
		let k = key(s.th.hex)
		if (ohexes.has(k)) {
			chex = s.th.hex
			s1 = s
			break
		}
		ohexes.add(k)
		const st = stern(s.th)
		k = key(st)
		if (ohexes.has(k)) {
			chex = st
			s1 = s
			break
		}
		ohexes.add(k)
	}
	if (!chex) return null
	// We have a collision-hex, and one ship. Get the other ship
	for (const s of ships) {
		if (s == s1) continue
		if (hexEq(s.th.hex, chex) || hexEq(stern(s.th), chex)) {
			s2 = s
			break
		}
	}
	// Cut "s.m" for the involved ships according to the rules, and
	// return the collision-hex immediately! (no checks for more
	// collisions)
	function hd(h, s2, step) {
		if (s2.m.charAt(step) == '1')
			return map.hd(h, s2.ph.hex)
		else
			return map.hd(h, stern(s2.ph))
	}
	function freeze(h, s1, s2, info) {
		// No ship moves. s1 occupied the chex, and s2 ran into it
		//console.log("freeze chex", map.hexToId(h), info)
		const chd = hd(h, s2, step)
		s1.m = s1.m.substring(0, step)
		s2.m = s2.m.substring(0, step)
		s1.th = s1.ph
		s2.th = s2.ph
		return chd
	}		
	function mov(h, s1, s2, info) {
		// s1 moves, s2 stays
		//console.log("mov chex", map.hexToId(h), info)
		const chd = hd(h, s2, step)
		s1.m = s1.m.substring(0, step+1)
		s2.m = s2.m.substring(0, step)
		s2.th = s2.ph
		return chd
	}
	function rand(h, s1, s2, info) {
		// Random ship moves, the other stays
		//console.log("rand chex", map.hexToId(h), info)
		let chd
		if (die.roll() < 4) {
			chd = hd(h, s2, step)
			s1.m = s1.m.substring(0, step+1)
			s2.m = s2.m.substring(0, step)
			s2.th = s2.ph
		} else {
			chd = hd(h, s1, step)
			s2.m = s2.m.substring(0, step+1)
			s1.m = s1.m.substring(0, step)
			s1.th = s1.ph
		}
		return chd
	}
	// 8.3.2. If the bow or stern of a ship is in the hex at the same
	// point in movement when one or more other ships attempt to enter
	// the hex, the occupying ship remains. The other ship is placed
	// in the hex(es) occupied just prior to the collision.
	if (hexEq(s1.ph.hex, chex) || hexEq(stern(s1.ph), chex))
		return freeze(chex, s1, s2, `occupied by ${s1.name}`)
	if (hexEq(s2.ph.hex, chex) || hexEq(stern(s2.ph), chex))
		return freeze(chex, s2, s1, `occupied by ${s2.name}`)
	// (now we know that chex is empty before this step)
	// 8.3.2. If the stern of a ship enters a hex in a turning
	// maneuver at the same point in the phase as the bow of another
	// ship, the bow enters the hex. The turning ship returns to its
	// previous position.
	const c1 = s1.m.charAt(step)
	const c2 = s2.m.charAt(step)
	if (c1 == '1' && (c2 == 'L' || c2 == 'R'))
		return mov(chex, s1, s2, "Turn cancelled")
	if (c2 == '1' && (c1 == 'L' || c1 == 'R'))
		return mov(chex, s2, s1, "Turn cancelled")
	// 8.3.2. In other cases, the ship that was plotted to move the
	// higher number of hexes in forward movement gets the hex. If
	// that number is tied, each player rolls a die. The high roller
	// occupies the hex.
	function countOnes(str) {
		let cnt = 0
		for (const c of str) if (c == '1') cnt++
		return cnt
	}
	const f1 = countOnes(s1.m)
	const f2 = countOnes(s2.m)
	if (f1 == f2) return rand(chex, s1, s2, "equal speed")
	if (f1 > f2)
		return mov(chex, s1, s2, `${s1.name} is faster`)
	else
		return mov(chex, s2, s1, `${s2.name} is faster`)
}
function hexEq(h1, h2) {
	return h1.x == h2.x && h1.y == h2.y
}
export function stern(hd) {
	const d = (hd.d + 3) % 6
	return map.adjacentHex({hex:hd.hex, d:d})
}
// Returns the distance from a ship to a hex
export function distanceHex(s, hex) {
	if (!s.hex) return 1000
	const ax = grid.hexToAxial(hex)
	const bowdist = grid.axialDistance(ax, grid.hexToAxial(s.hex))
	const st = stern(s)
	const sterndist = grid.axialDistance(ax, grid.hexToAxial(st))
	return bowdist < sterndist ? bowdist : sterndist
}
// Returns the distance between two ships
export function distance(s1, s2) {
	if (!s1.hex || !s2.hex) return 1000
	const bowdist = distanceHex(s1, s2.hex)
	const st = stern(s2)
	const sterndist = distanceHex(s1, st)
	return bowdist < sterndist ? bowdist : sterndist
}
// Return the player nationality for the ship
export function nat(s) {
	if (!sc.players) return s.nat
	// We have alliances
	for (const [key, value] of Object.entries(sc.players)) {
		if (value.includes(s.nat)) return key
	}
	return s.nat				// (fallback. should not happen)
}

// Returns a Konva.Group (ii = image identifier)
function createShipImg(s, i) {
	const img = new Konva.Group({
		id: `ship${i}`,
	})
	img.add(new Konva.Image({
		image: shipImage[s.ii],
		scale: {x: 0.55, y: 0.55},
		offsetX: 37,
		offsetY: 38,
	}))
	if (s.name) {
		const txt = new Konva.Text({
			fontFamily: "sans-serif",
			fontSize: 12,
			text: s.name,
			position: {x:20,y:30},
			fill: 'yellow',
		})
		txt.offsetX(txt.width()/2)
		txt.rotate(-90)
		img.add(txt)
	}
	if (s.nat in flagImage) {
		const flag = new Konva.Image({
			image: flagImage[s.nat],
			position: {x:8,y:82},
		})
		if (s.nat == "us")
			flag.scale({x: 0.07, y: 0.07})
		else if (s.nat == "pi")
			flag.scale({x: 0.07, y: 0.06})
		else
			flag.scale({x: 0.03, y: 0.03})
		flag.rotate(-90)
		img.add(flag)
	}
	s.img = img
}
async function loadImage(data) {
	const img = new Image()
	img.src = data
	await new Promise(resolve => img.onload = resolve)
	return img
}

const cqI = {
	El: 0,
	Cr: 1,
	Av: 2,
	Gr: 3,
	Po: 4,
}
export async function init(_ships, _scale = 1.0) {
	scale = _scale
	ships = _ships
	// Load and await images
	shipImage.sol = await loadImage(solData)
	shipImage.f = await loadImage(fData)
	flagImage.br = await loadImage(brflagData)
	flagImage.fr = await loadImage(frflagData)
	flagImage.sp = await loadImage(spflagData)
	flagImage.se = await loadImage(seflagData)
	flagImage.us = await loadImage(usflagData)
	flagImage.ru = await loadImage(ruflagData)
	flagImage.tu = await loadImage(tuflagData)
	flagImage.dk = await loadImage(dkflagData)
	flagImage.du = await loadImage(duflagData)
	flagImage.pi = await loadImage(piflagData)
	const fullSailsImg = await loadImage(fullSailsData)
	fullSailsTemplate = new Konva.Image({image: fullSailsImg})
	// Create a ship-class Map
	if (sc.classTable)
		classData = shipClasses[sc.classTable]
	else
		classData = shipClasses["ah_napoleonic"]
	for (const c of classData) shipClass.set(c.cid, c)
	// Fill in ship data
	for (const [i, s] of ships.entries()) {
		s.i = i
		// Ship data *may* define everything *or* use a pre-defined
		// class-id (cid), and optionally override some stats
		if (shipClass.has(s.cid)) {
			const c = shipClass.get(s.cid)
			for (const prop in c) {
				if (prop == "cid" || prop == "pv") continue
				if (!(prop in s)) s[prop] = c[prop]
			}
			if (!("pv" in s)) s.pv = c.pv[cqI[s.cq]]
		}
		createShipImg(s, i)
		s.img.cache()			// pre-render ships
		defineMovementAllowance(s)
		// Stats. These will change during the battle
		s.s = {
			hull: s.hull,
			guns: {l:s.guns, r:s.guns},
			crew: s.crew.split('-').map((x) => Number(x)),
			rigg: s.rigging.split('-').map((x) => Number(x)),
		}
		if (s.car) s.s.car = {l:s.car, r:s.car}
		s.ammo = {l:'R', r:'R'}
		if (sc.id == "test" && s.name == "Flying Dutchman" && s.nat == "du") {
			s.flyingDutchman = true
			s.mov = {
				turn: 4,
				battle: mAspect.FD,
				full: mAspect.FD,
			}
		}
	}
}
