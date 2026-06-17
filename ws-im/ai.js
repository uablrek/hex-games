// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the main AI module, and also contains the "solo" AI.

  An AI have only functions init() and play(). All needed data is
  taken from other modules, mostly 'main.js'.
*/

import {g, me, ships, sc, findTargets, fire, shipHexMap} from './main.js'
import {grid, sequence, die} from '@uablrek/hex-games'
import * as ship from './ship.js'
import * as map from './map.js'
import hixData from './solo.json'

// Import and extend for other AI's
const ais = {
	solo: {init: soloInit, play: soloPlay},
}
export let play
export function set(name) {
	if (!(name in ais)) name = "solo"
	ais[name].init(getAiPlayer())
	play = ais[name].play
}

// If sc.players is defined AI becomes the "other" player. Otherwise,
// AI is the nat() of the first ship not owned by the human player (me)
export function getAiPlayer() {
	let ai
	if (sc.players) {
		for (p in sc.players) {
			if (p != me) {
				ai = p
				break
			}
		}
	} else {
		for (const s of ships) {
			if (ship.nat(s) != me) {
				ai = ship.nat(s)
				break
			}
		}
	}
	return ai
}

/* ----------------------------------------------------------------------
  Solo AI

  The "solo" AI is an implementation of the "Solitarie System for
  WS&IM" by Mark Hunter. A scan of the article can be downloaded from:

    https://boardgamegeek.com/filepage/2333/solozip

  The "Enemy Ship Movement Table" is derived from 'woodsolo.txt' found in:

    https://boardgamegeek.com/filepage/277738/woodenship-solo-program

  Again I failed to find a clever algorithm for "Nearest Ship Attitude
  Diagram" with it's spiral coordinates. So, I made a program to
  create a Map(relativeAx->value) (hixMap).
*/
let ai
let hixMap
let hexToShip

function soloInit(aiPlayer) {
	ai = aiPlayer
	hixMap = new Map(hixData)
}
function soloPlay() {
	if (g.phase == "Planning") {
		soloPlanning()
		return
	}
	if (g.phase == "Combat") {
		soloCombat(0)
		return
	}
	alert(`AI called in unknown phase ${g.phase}`)
}
function soloPlanning() {
	// Create a Map() for all hexes containing ships.
	// It can be used for Set() operations (I like set's)
	hexToShip = shipHexMap()
	for (const s of ships) {
		if (ship.nat(s) != ai || !s.hex || s.surrendered) continue
		let ns = nearestShip(s)
		let forceLongDist = false
		if (!ns) {
			// There is no nearest ship in LoS, try without LoS,
			// but enforce long-distance lookup (dist > 3)
			ns = nearestShip(s, false)
			if (!ns) continue	// wtf...?
			forceLongDist = true
			g.log(s.name, "see-through at", ns.name)
		}
		let m = getMovement(ns, s, forceLongDist)
		if (!m || m == '0') continue
		s.m = m
		let mp = ship.mp(s)
		while (mp.mp < 0) {
			if (m.length == 1) {
				s.m = ''
				continue
			}
			m = m.substring(0, m.length-1)
			s.m = m
			mp = ship.mp(s)
		}
	}
	sequence.nextStep()
}
function soloCombat(i) {
	for (;i < ships.length; i++) {
		let s = ships[i]
		if (ship.nat(s) != ai || !s.hex || s.surrendered) continue
		if (!s.targets) {
			s.targets = {}
			if (s.ammo.l) s.targets.l = findTargets(s, s.fof.l)
			if (s.ammo.r) s.targets.r = findTargets(s, s.fof.r)
		}
		// Is fire animation starts, this function will be called again in 1s
		if (s.targets.l.length > 0)
			if (handleTarget(i, s, s.targets.l[0], 'l')) return
		if (s.targets.r.length > 0)
			if (handleTarget(i, s, s.targets.r[0], 'r')) return
	}
	sequence.nextStep()
}
function handleTarget(i, s, t, b) {
	s.target = {s:t, b:b}
	const dist = ship.distance(s, t)
	// save the initial broadside until we can fire at the hull, and rake
	if (dist > 5 && !s.hasFired) return false
	if (t.fullSails)
		fire(s, 'r')
	else
		fire(s, dist > 5 ? 'r':'h')
	setTimeout(soloCombat, 1000, i)
	return true
}

// ns=nearest ship, as=AI ship
function getMovement(ns, as, forceLongDist=false) {
	let key
	g.log(`Get movement for: ${as.name}, nearest ship: ${ns.name}`)
	// Get the key in the "Nearest Ship Attitude Diagram" (mm)
	// NOTE: distance must be to as's bow (no key in mm for stern)
	if (ship.distanceHex(ns, as.hex) > 3 || forceLongDist) {
		// Instead of checking hex-fields for the zone (A-F), we
		// compute the relative direction from 'ns' to 'as' (bows)
		// Rotate coordinate to the direction of the ship
		const rhex = rotate(ns.hex, ns.d, as.hex)
		let angle = getAngle(grid.hexToPixel(rhex))
		// The angle is right=0deg, but we want up=0deg
		angle = (angle + 270) % 360
		const ad = Math.floor(angle / 60)     // relative direction to 'as'
		const Z = "FEDCBA".charAt(ad)		  // (angles goes counteclock)
		// The number in the key is the direction to the stern for 'as'
		// NOTE: in the table dirs are 1-6
		const N = (as.d + 9 - ns.d) % 6
		key = `${Z}${N+1}`
		g.dbg("distance > 3 to", ns.name, angle, ad, ns.d)
	} else {
		const vb = getHixValue(ns, as.hex)
		const st = ship.stern(as)
		const vs = getHixValue(ns, st)
		key = `${vb}-${vs}`
	}
	const a = mm.get(key)		// (should always work)
	if (!a) {					// (but then again...)
		g.log("Key not found", key)
		return '0'
	}
	// compute the wind aspect for as
	const wa = (g.wind.d - as.d + 6) % 6
	// get movement string
	let mstr = a[wa]
	// The mstr can have 2 alternatives, separated by '-'
	if (mstr.includes('-')) {
		const marr = mstr.split('-')
		mstr = (die.roll() > 3) ?  marr[1] :  marr[0]
	}
	// mstr can have digits > 1, which we must convert to '1's
	let tmp = ''
	for (const c of mstr) {
		if (c > '1' && c < '9') {
			let i = Number(c)
			while (i--) tmp += '1'
		} else
			tmp += c
	}
	// remove any tailing 'B'
	// TODO: check if they serve any purpose
	let i = tmp.length - 1
	while (tmp.charAt(i) == 'B') i--
	mstr = tmp.substring(0, i + 1)
	g.log(as.name, key, a, wa, mstr)
	return mstr
}
// Get the value for a hex from the "Nearest Ship Attitude Diagram".
// The ship 's' gives diagram position and direction
function getHixValue(s, hex) {
	const cax = grid.hexToAxial(s.hex)
	const ax = grid.hexToAxial(hex)
	let rax = {r:ax.r - cax.r, q:ax.q - cax.q} // relative to cax
	rax.s = -rax.r - rax.q	// cubify
	// rotate
	// https://www.redblobgames.com/grids/hexagons/#rotation
	for (let i = 0; i < s.d; i++) {
		// [q,r,s] -> [-r,-s,-q]
		rax = {q: -rax.s, r:-rax.q, s:-rax.r}
	}
	const key = rax.r*1000 + rax.q
	return hixMap.get(key)
}
// Return the angle (0 <= angle < 360) in degrees from origo to point p.
// This is half of polar coordinates (we don't care about distance).
// (this specific for pixles where the y-axis grows downwards!)
function getAngle(p) {
	if (p.x == 0) return (p.y <= 0) ? 0 : 180 // (avoid inifinity)
	let a = Math.atan(-p.y / p.x) / Math.PI * 180
	// 'a' is within +-90, which is ok for dp.x>0
	if (p.x < 0) a += 180
	return (a + 360) % 360		// normalize to > 0
}
// Return the relative coordinates (to 'chex') of hex when rotaded 'd'
// steps around the center hex 'chex'
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

// Return the nearest "fiendly" (not controlled by the AI) ship in
// sight
function nearestShip(s, mustHaveLos=true) {
	if (ship.nat(s) != ai) return null
	let dist = 1000
	let nearest = null
	for (const fs of ships) {
		if (ship.nat(fs) == ai || !fs.hex) continue
		if (fs.surrendered) continue
		if (mustHaveLos && !los(s, fs)) continue
		const tdist = ship.distance(s, fs)
		if (tdist < dist) {
			nearest = fs
			dist = tdist
		}
	}
	return nearest				// may be null if blocked
}
function los(s1, s2) {
	// We check only bow-bow and stern-stern LoS
	const st1 = ship.stern(s1)
	const st2 = ship.stern(s2)
	const ownHexes = new Set()
	for (const hex of [s1.hex, st1, s2.hex, st2])
		ownHexes.add(map.hex(hex))
	const lineBB = getLine(s1.hex, s2.hex)
	const lineSS = getLine(st1, st2)
	const line = lineBB.union(lineSS)
	const shipsInLos = line.intersection(hexToShip)
	const blockingShips = shipsInLos.difference(ownHexes)
	return blockingShips.size == 0
}
// Get hex-objects for the line between 'from' and 'to'.
// https://www.redblobgames.com/grids/hexagons/#line-drawing
// TODO: move to lib/grid.js
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
	for (let i = 0; i <= hdist; i++) {
		const rex = i*dx/hdist
		const rey = rex*k
		const pos = {x:fpx.x + rex, y:fpx.y + rey}
		const hex = grid.pixelToHex(pos)
		s.add(map.hex(hex))
	}
	return s
}

// ----------------------------------------------------------------------
// Tables

// The 'woodsolo.txt' parsed. Basically unmodified
// Wind aspect: B, Al, Cl, D, Cr, Ar
const mm = new Map([
	["1-2", ['L1', 'L', 'L', 'L', 'L', 'BBB-2L']],
	["1-8", ['1R', 'BBB-2R', 'R', 'R', '1', '2L']],
	["1-9", ['R1-L1', 'L1', 'R', '0', 'L', 'L1']],
	["1-10", ['1B', '2R', '1', 'L', 'L', '2L']],
	["1-22", ['BB-2', '2R', '1', '0', '1', '2L']],
	["2-1", ['R1-RB', '2R-BBB', '1', 'R', 'R-B', '1RB']],
	["2-3", ['BR-B1', 'BBR-2L', '1', 'L', '1', 'BBR-3']],
	["2-10", ['1B', '2R', '1-R', '0', '1', '1BB']],
	["2-11", ['LB', 'BBB-R1B', 'L', 'L', 'R', 'L1B']],
	["2-12", ['RB', 'R1L', '1', 'R', 'B-R', '2L-1BB']],
	["3-2", ['BB-1B', '1R1-2R', 'R', '0-R', '1-R', '2R-R1B']],
	["3-4", ['1B-L1', '2L', '1', 'R', '1', 'BR1']],
	["3-12", ['B1', '1R1', 'B-1', '0-L', '1', 'L1R']],
	["3-13", ['R1', 'R1B', 'R', 'R', 'R', 'R1L']],
	["4-3", ['R1-1R', 'R1R', 'R', 'R', 'L', 'L1L']],
	["4-5", ['1B', '1L1', 'B-1', '0-L', '1', 'L1R']],
	["4-13", ['1B-BB', '1B1', '1-B', '0-R', '1', 'BBB-1R1']],
	["4-14", ['R1', '3', '1-L', 'L', 'L', 'LBB-B2']],
	["4-15", ['L1-R1', 'L1-R1B', 'R-1', 'R', '1', 'L2-BR1']],
	["5-4", ['R1', 'R2', 'B-R', 'R', 'B-1', '2R-R1']],
	["5-6", ['L1', 'BBB-L1', 'B', '0', 'L-B', '1L1']],
	["5-15", ['1B', '2R', '1', '0', '1', 'B1B-2R']],
	["5-16", ['L1-R1', 'L1R-R2', 'R', 'L-R', 'L', 'R2-L2']],
	["5-17", ['2-1B', '2L', '1', 'R', '1', '1B1']],
	["6-5", ['1B', 'R1L', '1', '0', '1', '1R1']],
	["6-7", ['LB', 'LBB', 'L', 'R-L', 'L', 'L1L-LBB']],
	["6-17", ['R1-LB', '2B-L1R', '1', 'L', '1', 'R1-1LB']],
	["6-18", ['2', '1L', 'R', 'R', 'R', '3']],
	["6-19", ['BB', '1BB-BBB', '1', '0', '1', '2L-BBB']],
	["7-6", ['1B-R1', 'R1B-2R', '1', '0', 'L', 'BBL']],
	["7-8", ['BB', '1L1', 'L', 'L', '1', '2L']],
	["7-19", ['LB-L1', 'L1R', 'L', 'L', 'R', 'BB1']],
	["7-20", ['B1', '2L-RBB', 'R-1', 'L', '1', '2L']],
	["8-1", ['1B-BB', 'L1L', 'L', 'L', '1', 'BB']],
	["8-7", ['BB-BL', 'BBL-2R', '1', '0', '1', '2L-BBL']],
	["8-20", ['L1-LB', 'L1R', '1', 'L', '1', 'L1R-LBB']],
	["8-21", ['R1', 'R1B', 'R', 'R', 'R', 'R1B']],
	["8-22", ['1B', '1L1', '1-L', 'L', 'B', 'B1B-2L']],
	["9-1", ['1R-1L', '3-1R1', 'R', 'R-L', 'L', '2L-R1L']],
	["9-10", ['BB', '1L1', 'R', '0', 'L', 'L2-L1B']],
	["9-22", ['BB-R1', 'R2', 'B', '0-R', 'B-R', '1R']],
	["9-23", ['L1-R1', 'L1-R1', 'B-1', 'L-R', '1', 'L2-BR1']],
	["9-24", ['1B', 'L1L-RBB', '1', '0', '1', 'L1L-B1B']],
	["9-42", ['2', '1BB', '1', 'R-0', '1', '2L-R1B']],
	["10-1", ['2-1L', 'RBB-R1R', 'L', 'L', 'L', '3-L1L']],
	["10-2", ['1L', '2L', 'L-1', 'L', 'L', 'BBR-2L']],
	["10-9", ['BB', 'B-1', '1-B', 'R', 'B', '3']],
	["10-11", ['1B', 'BB1', '1', '0', 'B-1', 'L2-1L1']],
	["10-24", ['R1', 'R2-L1R', '1', 'L', 'R-1', '2R-L1R']],
	["10-25", ['2-L1', 'BB1-L1R', 'R', '0-R', '1', '2B-BRB']],
	["11-2", ['LB', 'RBB-R1R', 'R', 'L', 'L', 'LBB-2L']],
	["11-10", ['BB', 'BBB-R2', 'R', 'R', 'R-L', 'L1L']],
	["11-12", ['1L-BB', '2L', 'B', 'L', 'B-L', '2L']],
	["11-25", ['2', '1R1-B1B', '1', '0-R', '1', '1B1-2R']],
	["11-26", ['L1', '1B1', 'L', 'L', 'L', '1R1']],
	["11-27", ['RB-2', 'R1B', 'R', 'R', 'R-1', 'RBB']],
	["12-2", ['RB', 'BBB-R1B', 'R', 'R', 'R', 'L1L']],
	["12-3", ['L1', 'LBB', 'L', 'L', 'L', 'L1B']],
	["12-11", ['1B', '1R1', 'B', '0', 'B', '1R1']],
	["12-13", ['BB-1B', 'L1R-R1L', '1', 'R', 'L', 'L2']],
	["12-27", ['R1', 'B2-B1B', '1', 'L', 'L', 'R1']],
	["12-28", ['RB', 'RBB', 'R', 'R', '1', 'RBB-1RB']],
	["13-3", ['LB', 'RBB', 'L', 'L', 'L', 'LBB']],
	["13-4", ['BB', 'BBB', 'B', '0', 'B', 'BBB']],
	["13-12", ['BB', 'R1B-R2', 'R', 'R', 'R', 'R1B-1R1']],
	["13-14", ['RB-1B', 'RBB', 'R-1', 'R', '1', '2B-RBB']],
	["13-28", ['1B', '1BB', '1', 'L-0', '1', '1BB-2B']],
	["13-29", ['R1', 'L1-R1', 'R', 'R', 'L', '1R1-L1B']],
	["14-4", ['LB', 'L1R', 'L', 'L', 'L', 'LBB-L1B']],
	["14-13", ['RB', 'RB1-RBB', 'R', 'R', 'R', 'RBB-L1L']],
	["14-15", ['BB', 'BBB', 'B', '0', '1-B', 'L1L-L2']],
	["14-29", ['BB', 'R1L', '1', 'R', '1', 'BBB-2B']],
	["14-30", ['1L', 'R2', 'L', 'L', 'L', 'R1-L2']],
	["14-31", ['2-1R', '1RB-L1R', '1', 'R', '1', 'L2L-L1R']],
	["15-4", ['L1', 'RBB', 'R', 'R', 'R', 'L1L']],
	["15-5", ['LB', 'L1-R1R', 'L', 'L', 'L', 'L1B']],
	["15-14", ['BB', '1R1', '1', '0', '1', '1R1-BBB']],
	["15-16", ['BB-B1', 'L1R', '1', '0', '1', 'L1R']],
	["15-31", ['2', '2B', 'L', 'L', 'L', '3-2B']],
	["15-32", ['1R', 'L1-1R1', 'R', 'R', 'R', 'L2-1R1']],
	["16-5", ['RB-LB', 'R1R', 'R', 'R-L', 'L', 'L1L']],
	["16-15", ['BB', 'R2-R1B', 'B', '0', 'B', 'BBB']],
	["16-17", ['BB', 'BBB', 'B', '0', 'B', 'L2']],
	["16-32", ['1B', '1BB-1B1', '1', '0', '1', '2B']],
	["16-33", ['R1-L1', '1L1', 'R', 'R', 'L', '1R1']],
	["16-34", ['2', '1BB', '1', '0', '1', '1BB']],
	["17-5", ['R1', 'R1B', 'R', 'R', 'R', 'R1']],
	["17-6", ['L1-LB', 'LBB', 'L', 'L', 'L', 'LBB-L1B']],
	["17-16", ['1B', 'BBB', 'B', '0', 'B', 'BBB']],
	["17-18", ['1B', 'BBB', 'B', '0', '1', 'BB1']],
	["17-34", ['1L', '2L', 'L', 'L', 'L', '2L']],
	["17-35", ['2', '2B-L1L', 'R', 'R', 'R', '2B-L1L']],
	["18-6", ['RB', 'R1B', 'R', 'R', 'R', 'R1B-L1L']],
	["18-17", ['BB', 'BBB', 'B', '0', 'B', 'BBB']],
	["18-19", ['BB', 'L1B-BBB', 'L', 'L', 'L', 'L1B']],
	["18-35", ['1B', '1LB-R1R', '1', 'L', '1-L', '1LB']],
	["18-36", ['1R', 'L2', 'R', 'R', 'R', '1R1']],
	["18-37", ['BB', 'BBB', '1', '0', 'B', '1BB']],
	["19-6", ['BB', 'R1B', 'B', 'R', 'B', 'BBB']],
	["19-7", ['RB', 'L1L', 'R', 'R', 'L', 'L1L']],
	["19-18", ['LB-1B', '2B-LBB', '1', 'L', '1', 'LBB-2B']],
	["19-20", ['BB', 'L1B-L2', 'L', 'L', 'L', 'L1B-BBB']],
	["19-37", ['R1', 'R1B-R2', 'L', 'L', 'R', 'R1B']],
	["19-38", ['1B-2', '2B-1BB', '1-B', 'R', '1', 'RBB-1BB']],
	["20-7", ['RB', 'R1B-1R1', 'R', 'R', 'L', 'R1R-L1L']],
	["20-8", ['LB', 'R1R-L1L', 'L', 'L', 'L', 'L1L-L1B']],
	["20-19", ['1B', 'BBB-1BB', '1B', '0', 'B-1', 'LBB-B1B']],
	["20-21", ['1B', '1L1', '1-L', '0', '1', 'BBB-1L1']],
	["20-38", ['L1', 'R2-2B', '1', 'L', 'L-1', 'LBB-1LB']],
	["20-39", ['RB', 'L1-R1B', 'R', 'R', 'R', '1B1-R1L']],
	["21-8", ['RB', 'RBB-1RB', 'R', 'R-L', 'L', 'L1L-RBB']],
	["21-20", ['BB-1R', '2R-BBB', 'B-R', 'R', 'R', '2R-BBB']],
	["21-22", ['L1', 'L1-R1R', 'L', 'L', 'B', 'BBB-L2']],
	["21-39", ['LB', '2B', '1', 'L', 'L', 'LBB']],
	["21-40", ['L1', '1L1-R2', 'R', 'R', 'R', 'R1-RBB']],
	["21-41", ['2', '1L1-2B', 'B', '0', '1', 'R1L-1BB']],
	["22-1", ['2-L1', '2R', 'L', 'L', 'B', 'R1R']],
	["22-8", ['1R', '2R', 'R', 'R', 'R', '2R']],
	["22-9", ['BB', '1LB', 'B', '0', '1-B', '1L1-BBB']],
	["22-21", ['1B', 'R2', 'B', '0', 'B-L', '2R']],
	["22-41", ['LB', '3', 'L', 'L', 'L', 'B2']],
	["22-42", ['1L', 'LBB', 'R', 'R', 'R', 'R1L']],
	["23-9", ['R1-L1', 'R1B-L1', 'L', 'L-R', 'R-L', 'L1B-R1']],
	["23-24", ['BB', 'BBB-R1R', 'L-B', 'L', 'L', 'L1B-L2']],
	["23-42", ['BB', 'BBB', 'B', '0-R', 'R', 'R1-BBB']],
	["23-43", ['L1-R1', '1R1-R2', 'R', 'R-L', 'R', '1L1-1R1']],
	["23-44", ['BB-1B', 'B1B', '1', '0', '1', 'L1R-2B']],
	["23-68", ['1B', '2B-R1R', '1', 'L', '1', '3-LBB']],
	["24-9", ['1R', 'BBB-RBB', 'R', 'R', 'R', 'L1L-R1']],
	["24-10", ['LB', '2L-R1R', 'L', 'L', 'L', 'L1B-2L']],
	["24-23", ['BB', 'R1R-1BB', '1-B', '0', 'B', '2R']],
	["24-25", ['1B', 'BBB', 'B', '0', 'B', 'L2']],
	["24-44", ['1L-R1', '2B-R2', 'L', 'L', '1', '1L1']],
	["24-45", ['2-1L', 'RBB-3', 'R', 'R', '1', '2B-L1L']],
	["25-10", ['RB-LB', 'R1R', 'R', 'R', 'L', 'L1L']],
	["25-11", ['1L', '2L', 'L', 'L', 'L', '1L-2L']],
	["25-24", ['BB', 'R1', 'B', 'R', 'B', '1R1-RR']],
	["25-26", ['RB', 'BBB-2B', 'R', '0', 'B', '1L1-L2']],
	["25-45", ['2', '3-R1R', '1', 'L', '1', 'R1R']],
	["25-46", ['1L', 'L1', 'R', 'L-R', 'R', '3-L2']],
	["26-11", ['LB', 'R1R', 'R', 'R', 'L', 'L1L-R1R']],
	["26-25", ['BB-R1', 'BBB-R1', 'R', 'R', 'R', 'L1L']],
	["26-27", ['BB-1B', '2L', 'B', 'L', 'B', 'BBB-2L']],
	["26-46", ['2', '3-LBB', 'B', '0', 'B-1', '1B1-R1L']],
	["26-47", ['R1', 'L1-1L1', 'L', 'L', 'L', '2R-L2']],
	["26-48", ['1R', '3-L1L', 'R', 'R', '1-B', '1BB']],
	["27-11", ['RB-R1', 'BBB-R2', 'R', 'R', 'R', 'L1L']],
	["27-12", ['LB', 'LBB-L1B', 'R', 'L', 'L', '1L1-L1B']],
	["26-26", ['2-BB', 'R1-R1L', 'B', '0', 'B', 'R1L']],
	["27-28", ['BB-1B', 'L1R-BBB', '1-B', '0-L', 'L-B', '3-1BB']],
	["27-48", ['L1', 'L1-1L1', 'L', 'L', 'L', '1L1-1R1']],
	["27-49", ['1R', '1RB', 'R', 'R', '1', '1BB-L1L']],
	["28-12", ['RB', 'R1B-R1R', 'R', 'L', 'L', 'L1L-R1R']],
	["28-13", ['L1', 'L1-1L1', 'B-L', 'L', 'L', 'L1B']],
	["28-27", ['BB-R1', 'R2', '1-B', '0-R', 'B', 'R1L']],
	["28-29", ['B1-R', '2L-L1R', '1', '0-R', '1-B', 'BBB-3']],
	["28-49", ['2', '3-2B', 'L', 'L', 'L', '2B-R2']],
	["28-50", ['L1', '2R-1RB', 'R', 'R', 'R', 'L2-2R']],
	["29-13", ['RB', 'R1R', 'L', 'L', 'L', 'BLB-R1R']],
	["29-14", ['BB', 'BBB-L1', 'B', '0', '1', 'L2']],
	["29-28", ['BB-R1', 'R1B-R2', 'R', 'R', 'R', 'R1-RBB']],
	["29-30", ['RB-2', '3-L1R', '1', 'R', '1', '1RB-L1L']],
	["29-50", ['2-1B', '3-R1R', '1', 'L', '1', '1BB']],
	["29-51", ['1L', '1R1', 'L', 'R', 'L', '1L1-2R']],
	["30-14", ['L1', 'R1R', 'L', 'L', 'L', 'LBB']],
	["30-29", ['BB', 'BBB-R1B', 'R', 'R', 'R', 'RBB-R1']],
	["30-31", ['BB', 'L1', 'B', '0', '1-B', 'L2-BBB']],
	["30-51", ['2', '2B-B1B', '1', '0', 'B', '1BB']],
	["30-52", ['1L', '2L', 'L', 'L', 'L', '1R1-2L']],
	["30-53", ['RB', 'L1R', '1', 'R', '1', 'L1L-3']],
	["31-14", ['RB-R1', 'R1B-BBB', 'R', 'R', 'R', 'R1']],
	["31-15", ['L1', 'LBB', 'L', 'L', 'L', 'LBB']],
	["31-30", ['1B-2', 'RlL', '1', '0', '1', '2R']],
	["31-32", ['BB', 'L1R', 'B-1', '0', '1', '1L1']],
	["31-53", ['R1', '2B-R2', '1', 'L', 'L', 'R1R-3']],
	["31-54", ['2', '2R', 'R', 'R', 'R', 'L1L-3']],
	["32-15", ['R1', 'L1L', 'R', 'R', 'L', 'LBB']],
	["32-16", ['BB', 'BL1', 'L', 'L', 'L', 'LBB']],
	["32-31", ['BB', 'R2', 'B', '0-R', 'B', 'R1L']],
	["32-33", ['1B', 'L1R', 'L', '0', '1', 'BBB-L1R']],
	["32-54", ['2', '3-R1R', '1', 'L', 'L-1', '2B-1LB']],
	["32-55", ['L1', 'L2', 'R', 'R', 'L', '1L1-3']],
	["33-16", ['LB-RB', 'R1R', 'R', 'R-L', 'L', 'L1L']],
	["33-32", ['R1-BB', 'R2', 'R', 'R', 'R', 'R1']],
	["33-34", ['BB-L1', 'L1', 'L-1', 'L', '1-L', 'L2-L1B']],
	["33-55", ['2', 'R1L', '1', '0', '1', 'R1L']],
	["33-56", ['1R-1L', 'R1B-1L1', 'R', 'R-L', 'L', 'L2-1R1']],
	["33-57", ['2', 'L1R-3', '1', '0', '1', 'L1R']],
	["34-16", ['R1', 'R2-R1B', 'R', 'R', 'R', 'R1']],
	["34-17", ['LB', 'R1R-L1', 'L', 'L', 'L', '2L-L1L']],
	["34-33", ['BB', 'R1L', '1', '0', '1', 'BBB']],
	["34-35", ['BB', 'L1R', 'B-1', '0', '1', 'L2']],
	["34-57", ['R1', '2L-R2', 'L', 'L', 'L', '1L1-R1']],
	["34-58", ['2', '1L1-2B', '1', 'R', '1', '3']],
	["35-17", ['RB', 'R2-R1B', 'R', 'R', 'R', 'L1L-R1']],
	["35-18", ['LB', 'L1', 'L', 'L', 'L', 'L1B']],
	["35-34", ['1B', 'R1L', '1', '0', 'B', 'BBB']],
	["35-36", ['BB', 'L1R', '1', '0', '1', 'L1R']],
	["35-58", ['1L', '3', 'L', 'L', 'L', '2L']],
	["35-59", ['1R', 'L1L-2R', 'R', 'R', '1', 'L2-3']],
	["36-18", ['RB', 'R1R', 'R', 'R', 'L', 'L1L-R1']],
	["36-35", ['BB', 'R1', 'B', 'R', 'B', 'R2']],
	["36-37", ['LB', 'L1', 'L', 'L', 'L', 'L2']],
	["36-59", ['2', '3', '1', 'L', '1', '1LB-R1R']],
	["36-60", ['1R', '2R', 'L', 'R', 'R', '2R']],
	["36-61", ['BB', 'BBB', '1', '0', '1', 'L1R']],
	["37-18", ['BB', 'R2', 'R', 'R', 'B', 'R2-BBB']],
	["37-19", ['LB', 'RBB-R1R', 'R', 'R', 'L', 'LBB']],
	["37-36", ['2', 'R1R-R1L', '1-L', 'L', 'L-1', '3-LBB']],
	["37-38", ['BB-L1', 'BBB-L1', 'L', 'L', 'L', 'L2-BBB']],
	["37-61", ['R1', '2L', 'L', 'L', 'L-R', '3']],
	["37-62", ['2-1B', 'L1L-L1R', '1', 'R', '1', 'L1L-3']],
	["38-19", ['R1', 'R1B', 'R', 'R', 'R', 'L1L-R1']],
	["38-20", ['LB', 'R1R', 'L', 'L', 'L', 'L1B']],
	["38-37", ['BB-2', 'LBB-3', '1-B', '0-R', '1-B', '2B-R1L']],
	["38-39", ['BB-1B', 'L1R', '1', '0-L', '1', 'L2-BBB']],
	["38-62", ['1L', 'R2', 'L', 'L', 'L-1', '2L']],
	["38-63", ['2', '2B-L1L', 'R-1', 'R', 'R-1', '3-L1L']],
	["39-20", ['RB', 'R1B', 'R', 'R', 'R', 'L1L']],
	["39-21", ['L1', 'L1-LBB', 'L', 'L', 'L', 'L2-LBB']],
	["39-38", ['BB-R1', 'R1L-2R', 'B-1', '0-R', '1-B', 'R1L-1R1']],
	["39-40", ['2-BB', 'L1R', 'B-1', '0-R', '1', '2B-1BB']],
	["39-63", ['1L', 'R1R-3', '1', 'L', 'L', '1LB']],
	["39-64", ['1R', '1L1-R2', 'R', 'R', 'R', 'R1-B-L1L']],
	["40-21", ['RB', 'RBB-2R', 'R', 'R', 'R', 'L1L']],
	["40-39", ['BB-R1', 'R2-R1B', 'B-R', '0-R', '1-R', 'BBB-R1L']],
	["40-41", ['BB', 'L1', 'L', 'L', 'B-L', 'L2-BBB']],
	["40-64", ['LB', '3', 'B-1', 'L', 'L', '3-LBB']],
	["40-65", ['1R', '2R-1R1', 'R', 'R', 'R', '1R1']],
	["40-66", ['2', 'L1R', '1', '0-R', '1', 'L1R-RBB']],
	["41-21", ['R1', 'R2-BBB', 'R', 'R', 'R', 'RBB']],
	["41-22", ['RB', '1R1-RBB', 'R', 'R', 'L', 'R1R-LBB']],
	["41-40", ['2', 'R2', 'B', '0', 'B', '2B-1BB']],
	["41-42", ['BB', 'L2', 'B', 'L', '1', 'L2']],
	["41-66", ['1L', '3-R2', 'L', '1', 'R', 'R1']],
	["41-67", ['2', '2B-RBB', 'R', 'R', '1', '3']],
	["42-9", ['LB', 'LBB-R1R', 'L', 'L', 'L', 'LBB']],
	["42-22", ['R1', 'R1B-2R', 'R', 'R', 'L', 'L1L']],
	["42-23", ['BB', '2L', 'B', '0', 'B', 'L1R']],
	["42-41", ['1B', 'R2-BBB', 'B', '0', '1', '1BB-1R1']],
	["42-67", ['2', '3-R1R', '1', 'L-R', '1', 'L1B']],
	["42-68", ['RB', 'L2', 'L-R', 'R', 'R', 'L2-3']],
	["A1", ['R1', 'R2-1R1', 'R', 'R-L', 'L', '2L']],
	["A2", ['2', '3-L1R', '1', 'L', '1-L', 'L2-3']],
	["A3", ['L1', 'L1-1L1', 'B-1', 'L', 'L-1', 'L2-L1L']],
	["A4", ['LB-L1', 'L1', 'L', 'L', 'L', 'L1L']],
	["A5", ['R1', 'R1R', 'R', 'R', 'L', 'R1-L1L']],
	["A6", ['R1', 'R2-R1R', 'R', 'R', '1-B', 'R1']],
	["B1", ['R1', 'R2', 'R', 'R', 'B-1', 'R1']],
	["B2", ['2', '3', '1', 'L-R', '1', '3-2L']],
	["B3", ['2-1R', '3-2R', '1', 'R', '1', '3']],
	["B4", ['L1', 'L1R', '1-B', 'L', 'L-1', 'L2-2L']],
	["B5", ['L1', 'L1-R1R', 'L', 'L', 'L', 'L1L-L2']],
	["B6", ['R1', 'R1R-R2', 'R', 'R', 'R', 'R1-L1L']],
	["C1", ['R1', 'R2-R1R', 'R', 'R', 'L', 'L1L']],
	["C2", ['1R-R1', 'R2-R1L', 'R', 'R', '1-B', 'R1-1R1']],
	["C3", ['2-1L', '3-2L', '1-R', 'R', '1', '3-2L']],
	["C4", ['2-1R', '3-2R', '1', 'R', 'L', '3-L2']],
	["C5", ['L1', 'L1-L1R', '1', 'L', 'L', 'L1R-L2']],
	["C6", ['L1', 'L1', 'L', 'L', 'L', 'L2-L1L']],
	["D1", ['L1', 'R1R', 'R', 'R-L', 'L', 'L1L']],
	["D2", ['R1', 'R1R-R2', 'R', 'R', 'R', 'R1']],
	["D3", ['1B-R1', 'R2', 'R', 'R', '1', 'R2']],
	["D4", ['2-1L', 'R2-3', '1', 'R', '1-L', '2L-3']],
	["D5", ['2', '3', '1', 'L', '1-L', '2L-3']],
	["D6", ['L1', 'L1', 'L', 'L', 'L', 'L2']],
	["E1", ['L1', 'L1R', '1', '0-L', '1', 'L2-2B']],
	["E2", ['L1', 'L1', 'L', 'L', 'L', 'L2']],
	["E3", ['R1-RB', 'R1R-RBB', 'R', 'R', 'R', 'L1L']],
	["E4", ['2-RB', '3-R2', '1', 'R', '1', 'R1L']],
	["E5", ['2-1L', '3-2L', '1-L', 'L', '1-L', '2-2L']],
	["E6", ['1R', '2R-3', 'R', 'R', '1', '3-2R']],
	["F1", ['2', '3-2R', '1', 'L-R', '1-L', '3-L2']],
	["F2", ['BB', 'L1R', '1', 'L', '1-L', '3-L2']],
	["F3", ['L1', 'R1R-L1', 'L', 'L', ':L', 'L1L-L2']],
	["F4", ['RB-R1', 'R1B-1R1', 'R', 'R', 'R', 'L1L-R1']],
	["F5", ['BB-2', 'R2', '1', 'R', '1', '3-BBB']],
	["F6", ['1L', '2L', 'R', 'R', '1-R', '3-2L']],
])
