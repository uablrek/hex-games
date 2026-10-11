// SPDX-License-Identifier: CC-BY-4.0.
/*
  Deployment module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr

  Contains the main game sequences, and the 'g' structure
*/

import Konva from 'konva'
import {sequence, box, ui, unit, grid} from '@uablrek/hex-games'
import {sc, updateInfo, isActive, selected} from './main.js'
import {sendMsg} from './server.js'
import * as map from './map.js'
import * as units from './units.js'
const log = console.log

export let g

// ----------------------------------------------------------------------
// Sequences

function updatePhase(seq) {
	let txt = `Turn: ${g.turn.year}, ${g.turn.season}\n`
	if (g.active) txt += `Active Player: ${g.active}\n`
	if (g.me) txt += `You play as: ${g.me}\n`
	txt += '\n'
	updateInfo('', txt)
}
function sendNextStep() {
	if (isActive() && g.mode == "pvp") sendMsg({type:"nextstep"})
}
sequence.add(new sequence.Sequence({
	name: "turn",
	steps: [
		{
			start: function(seq) {
				// ensure that players can't mess with units
				for (const u of unit.units)
					if (u.hex) {
						u.img.draggable(false)
						u.deletable = false
					}
				seq.nextStep()
			}
		},
		{
			//name: "Check for YSS",
			start: function(seq) {
				g.active = ''
				g.player = ''
				if (g.turn.season == "spring") {
					g.active = "Axis"
					sequence.jump(seq, "yss")
					return
				}
				seq.nextStep()
			}
		},
		{
			name: "Order of Play",
			start: (seq) => {
				updatePhase(seq)
				if (turnEq(g.turn, {year:1939, season:"fall"})) {
					g.active = "Axis"
					seq.nextStep()
					return
				}
				// We must decide which player that get the choice.
				// in pvp-mode it is the Axis player, ai-mode is NYI
				g.active = "Axis"
				if (isActive()) {
					choiceBox({
						text: "Who goes first?",
						choices: ['Axis', 'Allies'],
					}).then(function(value) {
						sendMsg({type: "choice", value: value})
						g.active = value
						seq.nextStep()
					})
				}
				// block both sides
				g.blockUI = true
			}
		},
		{
			start: function(seq) {
				g.blockUI = false
				g.player = g.active == "Axis" ? "ax" : "al"
				sequence.jump(seq, "player")
			},
		},
		{
			start: function(seq) {
				// Switch players
				g.player = g.player == "ax" ? "al" : "ax"
				g.active = g.player == "ax" ? "Axis" : "Allies"
				sequence.jump(seq, "player")
			},
		},
		{ start: sequence.back }
	],
}))
sequence.add(new sequence.Sequence({
	name: "player",
	steps: [
		{
			//name: "Prepare",
			start: function(seq) {
				for (const u of unit.units)
					if (u.hex) {
						u.img.draggable(false)
						u.deletable = false
					}
				seq.deploy = new Set()
				seq.nextStep()
			}
		},
		{
			name: "Declaration of War (DoW)",
			start: function(seq) {
				updatePhase()
				selected.fn = dow.bind(selected, seq)
			},
			end: function(seq) {
				selected.fn = null
				if (seq.deploy.size > 0) {
					// We have updated g.Axis and/or g.Allies, and
					// seq.deploy. Inform the remote player in PvP.
					// Then both sides must jump to the "deployment"
					// sequence
					const msg = {
						type: "control",
						Axis: Array.from(g.Axis),
						Allies: Array.from(g.Allies),
						deploy: Array.from(seq.deploy),
					}
					sendMsg(msg)
				} else
					sendNextStep()
			},
		},
		{
			// Deploy minor countlies after DoW
			start: function(seq) {
				if (seq.deploy.size == 0) {
					seq.nextStep()
					return
				}
				sequence.jump(
					seq, "deployment", {deploy: Array.from(seq.deploy)})
			}
		},
		{
			name: "Movement",
			start: function(seq) {
				// make controlled units draggable
				if (isActive()) {
					for (const u of unit.units)
						if (u.hex && g[g.active].has(u.nat))
							u.img.draggable(true)
				}
				units.enableSplitBox()
				updatePhase()
			},
			end: function(seq) {
				for (const u of unit.units) if (u.hex) u.img.draggable(false)
				units.disableSplitbox()
				sendNextStep()
			},
		},
		{
			start: function(seq) {
				sequence.jump(seq, "attrition")
			}
		},
		{
			start: function(seq) {
				sequence.jump(seq, "offensive")
			}
		},
		{
			name: "Unit Construction",
			start: updatePhase,
			end: sendNextStep,
		},
		{
			name: "Strategic Redeployment (SR)",
			start: function(seq) {
				// make controlled units draggable
				if (isActive()) {
					for (const u of unit.units)
						if (u.hex && g[g.active].has(u.nat))
							u.img.draggable(true)
				}
				updatePhase()
			},
			end: function(seq) {
				for (const u of unit.units) if (u.hex) u.img.draggable(false)
				sendNextStep()
			},
		},
		{
			name: "Remove units",
			start: updatePhase,
			end: sendNextStep,
		},
		{ start: sequence.back }
	],
}))

sequence.add(new sequence.Sequence({
	name: "yss",
	steps: [
		{
			name: "YSS",
			start: updatePhase,
			end: sendNextStep,
		},
		{
			name: "SW resolution",
			start: updatePhase,
			end: sendNextStep,
		},
		{
			name: "BRP calculation",
			start: updatePhase,
			end: sendNextStep,
		},
		{
			name: "SW construction",
			start: updatePhase,
			end: sendNextStep,
		},
		{ start: sequence.back },
	]
}))

sequence.add(new sequence.Sequence({
	name: "offensive",
	steps: [
		{
			name: "Offensive Option",
			start: function(seq) {
				updatePhase(seq)
				if (isActive()) {
					ui.pushKeys([
						{key:'s', fn:skipSequence.bind(seq)},
					])
				}
			},
			end: function(seq) {
				ui.popKeys()
				sendNextStep()
			},
		},
		{
			name: "Attacker naval+air",
			start: function(seq) {
				updatePhase(seq)
				// Make the active player's air and naval units draggable.
				// Make all air units deletable
				for (const u of unit.units) {
					if (!u.hex) continue
					if (u.type == "air") u.deletable = true
					if (g[p.active].has(u.nat))
						if (u.type == "air" || u.type == "nav")
							u.img.draggable(true)
				}
			},
			end: function(seq) {
				for (const u of unit.units) {
					if (!u.hex) continue
					u.img.draggable(false)
					u.deletable = false
				}
				ui.popKeys()
				sendNextStep()
			},
		},
		{
			name: "Defender inteception+DAS",
			start: updatePhase,
			end: sendNextStep,
		},
		{
			name: "Sea Transport Missions",
			start: updatePhase,
			end: sendNextStep,
		},
		{
			name: "Airborne drops",
			start: updatePhase,
			end: sendNextStep,
		},
		{
			name: "Combat",
			start: updatePhase,
			end: sendNextStep,
		},
		{
			name: "Exploitation",
			start: updatePhase,
			end: sendNextStep,
		},
		{ start: sequence.back },
	]
}))

sequence.add(new sequence.Sequence({
	name: "attrition",
	steps: [
		{
			name: "Attrition resolution",
			start: function(seq) {
				// flip active player
				g.active = otherFaction(g.active)
				// make units for the non-active player deletable
				if (isActive()) {
					enableDelete()
					for (const u of unit.units)
						if (u.hex && g[g.active].has(u.nat)) u.deletable = true
				}
				updatePhase()
			},
			end: function(seq) {
				disableDelete()
				sendNextStep()
				// flip active player back, and make units un-deletable
				g.active = otherFaction(g.active)
				for (const u of unit.units)
					if (u.hex) u.deletable = false
			},
		},
		{ start: sequence.back },		
	]
}))

// ----------------------------------------------------------------------
// Utility functions

let deleteMode = false
function enableDelete() {
	ui.pushKeys([{key:'d', fn:toggleDelete}])
	selected.oldFn = selected.fn
}
function disableDelete() {
	deleteMode = false
	selected.fn = selected.oldFn
	document.body.style.cursor = 'default'
	ui.popKeys()
}
function toggleDelete() {
	if (deleteMode) {
		deleteMode = false
		selected.fn = selected.oldFn
		document.body.style.cursor = 'default'
	} else {
		deleteMode = true
		document.body.style.cursor = 'not-allowed'
		selected.oldFn = selected.fn
		selected.fn = deleteSelected
	}
}
function deleteSelected() {
	if (!selected.u || !selected.u.deletable) return
	unit.remove(selected.u)
	sendMsg({type:"removeunit", i:selected.u.i})
	selected.u = null
}

function skipSequence(e) {
	// this = sequence
	ui.popKeys()
	// Tell the remote side
	sendMsg({ type: "skipsequence" })
	sequence.back(this)
}

// The active player has clicked on a hex (or unit)
// this = main.selected
function dow(seq) {
	const nat = this.h.nat
	if (!nat) return
	// countries you can't declare war on, or has no army
	if (["po","bl","ir","pl","sz","pe","ar","lx"].includes(nat)) return
	if (g.Axis.has(nat) || g.Allies.has(nat) || seq.deploy.has(nat)) return
	g.blockUI = true
	let natname = (nat in units.natName) ? units.natName[nat] : nat
	const pos = grid.hexToPixel(this.h.hex)
	choiceBox({
		text: `Declare war on ${natname}?`,
		choices: ["Yes", "No"],
		x: pos.x,
		y: pos.y,
	}).then(function(value){
		if (value == "Yes") {
			g.blockUI = false
			seq.deploy.add(nat)
			if (units.isMinorAlly(nat))
				g.Axis.add(nat)
			else
				g[otherFaction(g.active)].add(nat)
		}
	})
}
function otherFaction(p) {
	return p == "Axis" ? "Allies" : "Axis"
}
export function stepTurn() {
	switch (g.turn.season) {
	case "spring":
		g.turn.season = "summer"
		break
	case "summer":
		g.turn.season = "fall"
		break
	case "fall":
		g.turn.season = "winter"
		break
	case "winter":
		g.turn.season = "spring"
		g.turn.year = g.turn.year + 1
		break
	}
	// When the turn is stepped, we must check is new allowableBuilds
	// become available. If so, we add them to allowableBuilds[0].
	// (the "consumed" entry is kept since it does no harm)
	for (let i = 1; i < sc.allowableBuilds.length; i++) {
		if (turnEq(g.turn, sc.allowableBuilds[i].turn)) {
			addAllowables(sc.allowableBuilds[i].units)
			return true			// new allowable builds
		}
	}
	return false				// NO new allowable builds
}
function turnEq(t1, t2) {
	if (t1.year != t2.year) return false
	if (t1.season != t2.season) return false
	return true
}
function addAllowables(allowable) {
	unit.unselectAll()
	let filterOut = function(u) {
		if (u.allowable || u.selected) return true
		return false
	}
	for (const uh of allowable) {
		for (let i = 0; i < uh.cnt; i++) {
			const u = unit.fromStr(uh.type, filterOut)
			if (!u)
				console.log(`Unit not found ${d.type}`)
			else
				u.allowable = true
		}
	}
}

// The choiceBox is async. The UI (on both sides on PvP) should be
// blocked until a choice has been made. Use g.blockUI and .then()
let theChoiceBox
let choiceResolve
async function choiceBox(obj) {
	if (theChoiceBox) return
	theChoiceBox = box.choice(obj)
	ui.board.add(theChoiceBox)
	const pos = grid.pixelToHex(theChoiceBox.position())
	if (!map.isVisible(pos)) map.center(pos)
	return new Promise(function(resolve) {choiceResolve = resolve})
}
function destroyBox(e, group) {
	if (e == theChoiceBox) {
		theChoiceBox = null
		choiceResolve(group.name())
		return
	}
}
// This is called in PvP mode when the remote player is making the choice
export function setChoice(c) {
	choice = c
	sequence.nextStep()
}

// ----------------------------------------------------------------------
// Init
export function init() {
	g = sc						// (to be reconsidered?)
	box.destroyCallback(destroyBox)
	// Nations in control. Neutrals will be added to the non-attacking
	// faction. For now nations are never removed from these sets (but
	// it doesn't matter)
	const s = sc.status
	let a = [].concat(s.ge.controls, s.it.controls)
	g.Axis = new Set(a)
	a = [].concat(s.uk.controls, s.fr.controls, s.su.controls)
	g.Allies = new Set(a)
	if (g.turn.year == 1939) g.Allies.add("po")
	if (g.turn.year >= 1942) g.Allies.add("us")
}
