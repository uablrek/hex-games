// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the combat module for:
  https://github.com/uablrek/hex-games/tree/main/the-hill

  TODO: find a better way to handle EX results, perhaps with sequences
*/

import Konva from 'konva'
import {ui, sequence, server, unit, map, grid} from '@uablrek/hex-games'
import {g, updatePhase} from './game.js'
import crtData from './crt.svg'
import {recomputeZOC} from './map.js'
import {isActive, testMode} from './main.js'
import {sendNextStep, sendMsg} from './server.js'
const log = console.log

let crt
export async function init() {
	crt = new Konva.Group({
		draggable: true,
		x:1000,
		y:400,
	})
	const crtImg = await ui.imageFrom(crtData, {
		scaleX: 1.2,
		scaleY: 1.2,
	})
	crt.add(crtImg)
}

sequence.add(new sequence.Sequence({
	name: "combat",
	steps: [
		{
			name: "Combat",
			start: function(seq) {
				updatePhase(seq)
				for (const u of g.units) u.hasAttacked = false
				// For game play speed-up:
				// Check if any units can attack (only friendly units
				// in enemy zoc checked). In PvP this is tricky: both
				// sides checks this independently, and with
				// !canAttack we MUST NOT do a sendNextStep() !!
				seq.canAttack = false
				recomputeZOC()
				for (const u of g.units) {
					if (!u.hex) continue
					if (u.nat != g.nat) continue
					const h = map.getHex(u.hex)
					if (h.zoc) {
						seq.canAttack = true
						break
					}
				}
				if (!seq.canAttack) {
					sequence.back(seq) // Nope, no engaged units
					return
				}
				ui.board.add(crt)
				if (isActive()) {
					ui.setKeys([
						{key:'a', fn:attack},
						{key:'1', fn:attack},
						{key:'2', fn:attack},
						{key:'3', fn:attack},
						{key:'4', fn:attack},
						{key:'5', fn:attack},
						{key:'6', fn:attack},
					])
					updatePhase(seq)
					return
				}
				// The non-active player shoud wait
				if (g.mode == "ai") {
					ui.env.set("PS", "Wait for AI player...")
					updatePhase(seq)
					ai.play()
				} else {
					ui.env.set("PS", "Wait other player...")
					updatePhase(seq)
				}
			},
			end: function(seq) {
				crtMarker.remove()
				crt.remove()
				ui.removeKeys('a','1','2','3','4','5','6')
				ui.env.set("PS", '')
				removeTargetMarker()
				unsetAttackers()
				// Only sendNextStep() if we can attack
				if (isActive() && seq.canAttack) sendNextStep()
			},
		},
		{ start: sequence.back },
	],
}))

// ----------------------------------------------------------------------
const ex = {
	af: 0,
	df: 0,
}
const targetMarkerTemplate = new Konva.Group()
targetMarkerTemplate.add(new Konva.Circle({
	radius: 20,
    stroke: 'white',
}))
targetMarkerTemplate.add(new Konva.Path({
    stroke: 'white',
	data: "M 0 -20 l 0 10 m 0 20 l 0 10 M -20 0 l 10 0 m 20 0 l 10 0",
}))
let targetMarker
function setTargetMarker(h) {
	let pos = grid.hexToPixel(h.hex)
	if (!targetMarker) {
		targetMarker = targetMarkerTemplate.clone()
		targetMarker.position(pos)
		ui.board.add(targetMarker)
	} else
		targetMarker.position(pos)
	crtMarker.remove()
	if (g.player == g.me) sendMsg({type: "target", hex: h.hex})
}
function removeTargetMarker() {
	if (targetMarker) {
		targetMarker.destroy()
		targetMarker = null
	}
	targetHex = null
}

let targetHex
let attackers = new Set()
export function unitClick(u) {
	// A unit-click in Combat phase can be:
	//  1. enemy unit to attack
	//  2. frendly unit to add to attackers
	//  3. any unit to remove as an EX result
	if (ex.af > 0 || ex.df > 0) {
		exRemove(u)
		return
	}
	let h = map.getHex(u.hex)
	if (u.nat != g.nat) {
		removeTargetMarker()
		unsetAttackers()
		setTargetMarker(h)
		targetHex = h
	} else {
		if (!targetHex) return
		if (u.hasAttacked) return
		// Units have range 1, except artillery which have 2
		let d = grid.axialDistance(targetHex.ax, h.ax)
		if (d <= 1 || u.type == 'art' && d <= 2) addAttacker(u)
	}
}
function addAttacker(u) {
	attackers.add(u)
	unit.addMark1(u, 'red')
	computeOdds()
	if (g.player == g.me) sendMsg({type: "addattacker", i: u.i})
}
function unsetAttackers() {
	for (const u of attackers) unit.removeMark1(u)
	attackers.clear()
}
function isUpslope(hex, target) {
	let h = map.getHex(hex)
	if (!h.edges) return
	if (grid.axialDistance(h.ax, target.ax) > 1) return false
	let neighbours = grid.neighboursAxial(h.ax)
	let i
	for (i = 0; i < 6; i++)
		if (neighbours[i] == target) break
	return h.edges.charAt(i) == 'u'
}
function isRiver(hex) {
	let h = map.getHex(hex)
	return h.prop && h.prop.includes('r')
}

const crtMarker = new Konva.Circle({
	stroke: 'red',
	radius: 16,
})
function updateCrt(x, die=0) {
	if (x > 5) x = 5
	if (x < 0) x = 0
	let pos = {x:x * 60 + 26, y:die*24+12}
	crtMarker.position(pos)
	if (!crtMarker.getParent())
		crt.add(crtMarker)
}
const ctrMatrix = [
	['AE','AE','AE','AE','EX','EX'],
	['AE','AE','AE','EX','EX','DE'],
	['AE','AE','EX','EX','DE','DE'],
	['AE','EX','EX','DE','DE','DE'],
	['EX','EX','DE','DE','DE','DE'],
	['EX','DE','DE','DE','DE','DE'],
]
function computeOdds(die=0) {
	let a = 0, d = 0
	for (const u of attackers) {
		if (isUpslope(u.hex, targetHex) || isRiver(u.hex))
			a += (u.s/2)
		else
			a += u.s	
	}
	for (const u of targetHex.units) d += u.s
	if (targetHex.prop && targetHex.prop.includes('f')) d = d * 2
	let x = 2
	if (a >= d)
		x += (Math.floor(a/d) - 1)
	else
		x -= (Math.ceil(d/a) - 1)
	updateCrt(x, die)
	if (die == 0) return ''
	if (x < 0) return 'AE'
	if (x > 5) return 'DE'
	return ctrMatrix[die-1][x]
}
// Called in attack 'a', or '1-6' in test mode
function combat(die) {
	if (!isActive()) return
	if (!targetHex || attackers.size == 0) return
	for (const u of attackers) u.hasAttacked = true
	if (!die) die = Math.floor(Math.random() * 6) + 1
	let outcome = computeOdds(die)
	// TODO: send to server
	if (outcome == "EX") {
		// We must find the lowest factors, defender or attacker,
		// remove them, and remove their markers. Then make so a click
		// removes a unit, while disabling just about everything else.
		let a = 0, d = 0
		for (const u of targetHex.units) d += u.s
		for (const u of attackers) a += u.s
		if (g.player == g.me) {
			const msg = {type:"attack", die: die, outcome: "EX"}
			msg.a = a
			msg.d = d
			sendMsg(msg)
		}
		handleEX(a, d)
		return
	}
	if (outcome == "DE") {
		removeDefenders()
		unsetAttackers()
	} else {
		removeAttackers()
		removeTargetMarker()
	}
	if (g.player == g.me) sendMsg({type:"attack", die: die, outcome: outcome})
}
function removeDefenders() {
	for (const u of targetHex.units) unit.remove(u)
	removeTargetMarker()
}
function removeAttackers() {
	for (const u of attackers) unit.remove(u)
	unsetAttackers()
}
function handleEX(a, d) {
	//log("handleEX",a,d)
	if (Math.abs(a-d) < 3) {
		// There is no unit with u.s < 3, so remove all
		removeDefenders()
		removeAttackers()
		return
	}
	g.blockUI = true	 // block nextStep
	// Now we know that we have a difference >= 3
	if (a > d) {
		removeDefenders()
		// The attacker marks are still on
		ex.af = d
		ui.env.set("PS", `Attacker must remove ${d} factors`)
		updatePhase()
	} else {
		removeAttackers()
		// The peer-player should remove units
		// The targetMarker blocks clicks on the units. Remove it
		// and add marks on the units instead
		targetMarker.destroy()
		targetMarker = null
		for (const u of targetHex.units) unit.addMark1(u, 'red')
		ex.df = a
		ui.env.set("PS", `Defender must remove ${a} factors`)
		updatePhase()
	}
}
function exDone() {
	ex.af = 0
	ex.df = 0
	g.blockUI = false
	ui.env.set("PS", '')
	unsetAttackers()
	if (targetHex)
		for (const u of targetHex.units) unit.removeMark1(u)
	updatePhase()
}
function attack(e) {
	if (testMode)
		combat(Number(e.key))
	else
		combat(0)
}

function exRemove(u) {
	if (ex.af > 0) {
		if (!isActive()) return
		if (!attackers.has(u)) return
		unit.remove(u)
		sendMsg({type:"removeunit", i:u.i})
		ex.af -= u.s
		if (ex.af <= 0) {
			exDone()
			sendMsg({type:"exdone"})
		}
	} else if (ex.df > 0) {
		// In Solitarie mode the one player removes units. The AI
		// player never attacks, so we will never get here. In PvP
		// mode the non-active player should remove defenders
		if (g.mode == "pvp" && isActive()) return
		if (!targetHex.units.has(u)) return
		unit.remove(u)
		sendMsg({type:"removeunit", i:u.i})
		ex.df -= u.s
		if (ex.df <= 0) {
			exDone()
			sendMsg({type:"exdone"})
		}
	}
}

export function handleMessage(msg) {
	// A message from the other player
	let u
	switch (msg.type) {
	case "target":
		removeTargetMarker()
		unsetAttackers()
		targetHex = map.getHex(msg.hex)
		setTargetMarker(targetHex)
		break
	case "addattacker":
		addAttacker(g.units[msg.i])
		break
	case "attack":
		computeOdds(msg.die)	// (just to update CRT)
		if (msg.outcome == "DE") {
			removeDefenders()
			unsetAttackers()
		} else if (msg.outcome == "AE") {
			removeAttackers()
			removeTargetMarker()
		} else {
			handleEX(msg.a, msg.d)
		}
		break
	case "exdone":
		exDone()
		break
	}
}

