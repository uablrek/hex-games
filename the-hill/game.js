// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the game module for:
  https://github.com/uablrek/hex-games/tree/main/the-hill
*/

import Konva from 'konva'
import {ui, box, sequence, server, unit, map, grid} from '@uablrek/hex-games'
import {updateInfo, isActive, selected, testMode} from './main.js'
import {sendPlayerDeployment, sendNextStep, sendMsg} from './server.js'
import * as units from './units.js'
import * as ai from './ai.js'
import * as combat from './combat.js'
import {recomputeZOC, allHexes} from './map.js'
const log = console.log

// The universal game structure
export const g = {
	sides: ["French", "English"],
	turn: {h:10, m:0},
	me: '',						// ''|English|French
	player: 'None',				// English|French
	phase: '',
	nat: '',					// en|fr
	mode: "solitarie",			// solitarie|pvp|ai
	objectives: [],
}

// ----------------------------------------------------------------------
// Sequences

// imported by combat.js
export function updatePhase(seq) {
	if (!seq) seq = sequence.currentSequence()
	g.phase = seq.currentStep.name
	updateInfo(g.phase)
}

// This is the top sequence
sequence.add(new sequence.Sequence({
	name: "game",
	steps: [
		{
			name: "Welcome",
			start: function(seq) {
				// ai, pvp or solitarie?
				server.getUrl(g)
				ui.env.set("PS", '')
				g.save = `the-hill-${g.slot}`
				switch (g.mode) {
				case "ai":
					if (!g.side || g.side != g.sides[1]) {
						g.me = g.sides[0]
						ai.player(g.sides[1])
					} else {
						g.me = g.sides[1]
						ai.player(g.sides[0])
					}
					ui.env.set("MODE", "AI")
					ui.env.set("SIDE", g.me)
					break
				case "pvp":
					ui.env.set("MODE", "PvP")
					ui.env.set("SIDE", "(don't know yet)")
					break
				default:
					ui.env.set("MODE", "Solitarie")
					ui.env.set("SIDE", "Both")
				}
				ui.env.set("PS", ui.getHelp(g.mode))
				updatePhase(seq)				
			}
		},
		{
			//name: "connect to server",
			start: function(seq) {
				if (g.server)
					sequence.jump(seq, "server")
				else
					// Solitarie or AI
					seq.nextStep()
			},
			end: function(seq) {
				if (g.mode == "pvp") ui.env.set("SIDE", g.me)
			}
		},
		{
			//name: "Check for snapshot",
			start: function(seq) {
				const s = localStorage.getItem(g.save)
				if (g.mode == "pvp" || !s) {
					seq.nextStep()
					return
				}
				box.choiceBox({
					text: "A snapshot was found. Use it?",
					choices: ['Yes', 'Discard'],
					keys: ['y', 'd'],
					mid: {x:0.4, y:0.2},
				}, ui.info, true).then(function(value) {
					if (value == "Yes")
						restore(JSON.parse(s))
					else {
						localStorage.removeItem(g.save)
						seq.nextStep()
					}
				})
			}
		},
		{
			name: "English Deployment",
			start: function(seq) {
				g.player = "English"
				g.nat = 'en'
				updatePhase(seq)
				if (isActive()) {
					units.deployEnglish()
					return
				}
				if (g.mode == "ai") ai.play()
			},
			end: function(seq) {
				if (g.unitBox) g.unitBox.destroy()
			}
		},
		{
			name: "Validate English Deployment",
			start: function(seq) {
				// Only the active PvP player validates
				if (g.mode == "pvp" && !isActive()) {
					seq.nextStep()
					return
				}
				if (units.validDeployment()) {
					sendPlayerDeployment()
					seq.nextStep()
					sendNextStep()
				} else
					seq.gotoStep("English Deployment")
			},
		},
		{
			name: "French Deployment",
			start: function(seq) {
				g.player = "French"
				g.nat = 'fr'
				updatePhase(seq)
				if (isActive()) {
					units.deployFrench()
					return
				}
				if (g.mode == "ai") ai.play()
			},
			end: function(seq) {
				if (g.unitBox) g.unitBox.destroy()
			}
		},
		{
			name: "Validate French Deployment",
			start: function(seq) {
				if (g.mode == "pvp" && !isActive()) {
					seq.nextStep()
					return
				}
				if (units.validDeployment()) {
					sendPlayerDeployment()
					sendNextStep()
					seq.nextStep()
				} else
					seq.gotoStep("French Deployment")
			},
		},
		{
			name: "French Turn",
			start: function(seq) {
				g.player = "French"
				g.nat = 'fr'
				if (g.mode != "pvp" && isActive()) snapshot()
				seq.nextStep()
			}
		},
		{
			start: function(seq) {
				sequence.jump(seq, "player")
			},
		},
		{
			name: "English Turn",
			start: function(seq) {
				g.player = "English"
				g.nat = 'en'
				if (g.mode != "pvp" && isActive()) snapshot()
				seq.nextStep()
			},
		},
		{
			start: function(seq) {
				sequence.jump(seq, "player")
			},
		},
		{
			name: "Check Winner",
			start: function(seq) {
				// If all objectives are occupied by French units,
				// France wins
				if (checkFrenchVictory()) {
					g.winner = "France"
					seq.gotoStep("Declare Winner")
				} else
					seq.nextStep()
			}
		},
		{
			name: "Step Turn",
			start: function(seq) {
				if (stepTurn())
					seq.gotoStep("French Turn")
				else
					seq.nextStep()
			}
		},
		{
			name: "Declare Winner",
			start: function(seq) {
				if (g.winner == "France") {
					g.player = "France"
					updateInfo("French Winner")
				} else {
					g.player = 'England'
					updateInfo("English Winner")
				}
				// Remove any lingering snapshot
				if (g.mode != "pvp")
					localStorage.removeItem(g.save)
			}
		},
	],
}), true)

sequence.add(new sequence.Sequence({
	name: "player",
	steps: [
		{
			name: "Movement",
			start: function(seq) {
				recomputeZOC()
				if (isActive()) {
					ui.setKeys([{key:'r', fn:regretMove}])
					updatePhase(seq)
					return
				}
				// The non-active player should wait
				if (g.mode == "ai") {
					ui.env.set("PS", "Wait for AI player...")
					updatePhase(seq)
					ai.play()
				} else {
					ui.env.set("PS", "Wait for other player...")
					updatePhase(seq)
				}
			},
			end: function(seq) {
				for (const u of g.units) {
					if (u.nat != g.nat) continue
					unit.removeMark1(u)
					u.ohex = null
				}
				removeMarkers()
				ui.removeKeys('r')
				ui.env.set("PS", '')
				if (isActive()) sendNextStep()
			}
		},
		{
			start: function(seq) {
				sequence.jump(seq, "combat")
			}
		},
		{ start: sequence.back },
	],
}))

// ----------------------------------------------------------------------
// Movement

let mask
function setMarker(h) {
	if (mask) mask.destroy()
	mask = new Konva.Group({
		clip: {
			x:0, y:0,
			width: 1400,
			height: 1000,
		},
	})
	const unreachable = allHexes.difference(allowedHexes)
	for (const h of unreachable.values()) {
		mask.add(grid.hmask.clone({
			fill: 'black',
			opacity: 0.3,
			position: grid.hexToPixel(h.hex),
		}))
	}
	ui.board.add(mask)
}
function removeMarkers() {
	allowedHexes = null
	if (mask) {
		mask.destroy()
		mask = null
	}
}

let selectedUnit
let allowedHexes
function movementClick(u) {
	let h = map.getHex(u.hex)
	// Check if this click is a movement-click (not a unit-select click)
	if (allowedHexes && allowedHexes.has(h)) {
		if (selectedUnit) moveSelectedUnit(h)
		return
	}
	removeMarkers()				// (clears allowedHexes)
	selectedUnit = u
	if (u.nat != g.nat) return	// Other's movement phase
	if (u.ohex) return			// Has already moved
	allowedHexes = grid.movementAxial(u.m, h.ax, u)
	for (const h of allowedHexes) {
		// exclude hexes with >=2 units
		if (h.units && h.units.size >= 2)
			allowedHexes.delete(h)
	}
	setMarker()
}
function moveSelectedUnit(h) {
	if (!selectedUnit || !allowedHexes) return
	if (!allowedHexes.has(h)) return
	removeMarkers()
	moveUnit(selectedUnit, h)
}
// imported by ai.js
export function moveUnit(u, h) {
	//log("moveUnit", u, h)
	u.img.moveToTop()
	unit.moveTo(u, h.hex)
	if (g.mode == "pvp") {
		const msg = {
			type: "move",
			i: u.i,
			hex: u.hex,
		}
		sendMsg(msg)
	}
}
function regretMove() {
	if (!isActive()) return
	if (!selectedUnit) return
	unit.regretMove(selectedUnit)
	sendMsg({type: "regret", i:selectedUnit})
}


// ----------------------------------------------------------------------
// Utils

// Returns false at end-of-game
function stepTurn() {
	if (g.turn.m >= 45) {
		g.turn.m = 0
		g.turn.h++
	} else
		g.turn.m += 15
	return g.turn.h < 12
}
function checkFrenchVictory() {
	let occupied = 0
	for (const h of g.objectives) {
		if (h.units) {
			for (const u of h.units) {
				if (u.nat == 'fr') occupied++
				break
			}
		}
	}
	return occupied == 3
}

function snapshot() {
	const s = {}
	for (const f of ["turn", "mode", "nat", "player", "me"]) s[f] = g[f]
	s.deployment = []
	for (const u of g.units)
		if (u.hex) s.deployment.push({i:u.i, hex:u.hex})
	s.seq = sequence.snapshot()
	localStorage.setItem(g.save, JSON.stringify(s))
}

function restore(s) {
	for (const f of ["turn", "mode", "nat", "player", "me"]) g[f] = s[f]
	for (const uh of s.deployment) {
		const u = g.units[uh.i]
		unit.place(uh, ui.board)
	}
	if (s.mode == "ai") ai.player(g.me == "French" ? "English" : "French")
	sequence.restore(s.seq).nextStep()
}

// main.select.fn is set to this function
function clickSelected(e) {
	if (this.u) {
		if (g.phase == "Movement") {
			if (isActive()) movementClick(this.u)
		} else
			combat.unitClick(this.u)
	} else {
		// board-click is only handled in Movement phase
		if (g.phase == "Movement" && isActive()) moveSelectedUnit(this.h)
	}
}

export async function init() {
	selected.fn = clickSelected
	await combat.init()
}

export function handleMessage(msg) {
	// A message from the other player
	let u
	switch (msg.type) {
	case "nextstep":
		sequence.nextStep()
		break
	case "deployment":
		for (const uh of msg.units) {
			unit.place(uh, ui.board)
		}
		break
	case "move":
		u = g.units[msg.i]
		unit.moveTo(u, msg.hex)
		selectedUnit = u
		break
	case "regret":
		unit.regretMove(selectedUnit)
		break
	case "removeunit":
		u = g.units[msg.i]
		unit.remove(u)
		break
	case "target":
	case "addattacker":
	case "attack":
	case "exdone":
		combat.handleMessage(msg)
		break
	}
}
