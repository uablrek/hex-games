// SPDX-License-Identifier: CC-BY-4.0.
/*
  Deployment module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
*/

import {sequence, ui, map, unit} from '@uablrek/hex-games'
//import {g} from './game.js'
import {sc, updateInfo, isActive} from './main.js'
import {g} from './game.js'
import * as units from './units.js'
import * as server from './server.js'
const log = console.log

function stepInit(seq, info='') {
	let txt = sequence.getSeqHelp(`deployment-${seq.nat}-${sc.turn.year}`)
	if (!txt) txt = `Deploy unit in ${units.natName[seq.nat]}`
	if (g.me)
		txt += `\n\nYou play as: ${g.me}`
	updateInfo(txt + info)
}

// The .deploy field in this sequence must be assiged the countries to
// deploy. Example;
//   sequence.jump(seq, "deployment", {deploy: "dk", "no"}
sequence.add(new sequence.Sequence({
	name: "deployment",
	ni: 0,
	steps: [
		{
			start: function(seq) {
				ui.pushKeys([
					{key:'l', fn:autoDeploy},
				])
				unit.unselectAll()
				if (!seq.deploy) {
					seq.deploy = []
					seq.gotoStep("Next Deployment")
					return
				}
				seq.ni = 0
				seq.nextStep()
			}
		},
		{
			name: "Deploment",
			start: function(seq) {
				seq.nat = seq.deploy[seq.ni]
				g.active = g.Axis.has(seq.nat) ? "Axis":"Allies"
				// make all already placed units un-draggable
				for (const u of unit.units)
					if (u.hex) u.img.draggable(false)
				if (!isActive()) {
					stepInit(seq, "\n\nWaiting for other player...")
					return
				}
				stepInit(seq)
				//log("usesNu", seq.nat, usesNu(seq.nat))
				if (usesNu(seq.nat)) {
					seq.unitbox = units.deploy(
						"nu", (u)=>u.selected, ubHex[seq.nat])
					return
				}
				if (units.isMajor(seq.nat))
					seq.unitbox = units.deploy(seq.nat, (u)=>!u.initial)
				else
					seq.unitbox = units.deploy(seq.nat, (u)=>u.selected)
			},
			end: function(seq) {
				natToNu()
				if (seq.unitbox) seq.unitbox.destroy()
				if (g.mode == "pvp" && isActive())
					sendDeployment(seq.nat)
			}
		},
		{
			name: "Next Deployment",
			start: function(seq) {
				seq.ni++
				if (seq.ni >= seq.deploy.length) {
					ui.popKeys()
					// Restore the active player. The non-active
					// player deploys countries that are attacked
					g.active = g.player == "ax" ? "Axis" : "Allies"
					sequence.back(seq)
					// Add a dragend send a move message.
					// NOTE: handlers are cumulative!
					for (const u of unit.units)					
						if (u.hex && !u.dragend) {
							u.dragend = true
							u.img.on('dragend.sndmsg', dragEnd)
						}
					return
				}
				// More nations to deploy
				//log("More to deploy", seq.deploy[seq.ni])
				seq.gotoStep("Deploment")
			}
		},
	],
}))

// Automatic initial deployment. Any already deployed units are removed
function autoDeploy(e) {
	if (!isActive()) return
	const seq = sequence.currentSequence()
	if (!seq.unitbox) return			// already auto-deployed
	seq.unitbox.destroy()
	seq.unitbox = null
	const dep = sc.deployment.units
	if (usesNu(seq.nat)) {
		// For neutrals we must remove already-deployed units first
		for (const u of unit.units)
			if (u.hex && u.nat == 'nu') unit.remove(u)
		for (const uh of dep) {
			const h = map.getHex(uh.hex)
			if (h.nat == seq.nat) unit.place(uh, ui.board, true)
		}
	} else {
		for (const uh of dep) {
			const nat = uh.u.split(',')[0]
			if (nat == seq.nat) unit.place(uh, ui.board, true)
		}
	}
	
}
// Uses neutral units
function usesNu(nat) {
	return ["be","dk","nl","gr","no","po","sw","yu"].includes(nat)
}
// Set .nat to the land they are deployed for neutral units
function natToNu() {
	for (const u of unit.units) {
		if (!u.hex) continue
		if (u.nat != "nu") continue
		const h = map.getHex(u.hex)
		u.nat = h.nat
	}
}
function sendDeployment(nat) {
	// Prerequisite: Neutral units must have .nat updated by natToNu()
	let msg = {type: "deployment", units: []}
	for (const u of unit.units) {
		if (!u.hex) continue
		if (u.nat != nat) continue
		msg.units.push({i:u.i, hex:u.hex})
	}
	server.sendMsg(msg)
	server.sendNextStep()
}
function dragEnd(e) {
	let u = unit.fromImg(e.target)
	server.sendMsg({
		type: "move",
		i: u.i,
		hex: u.hex,
	})
}

// UnitBox placement hexes for countries using "nu" units
const ubHex = {
	po: {x:23, y:6},
	dk: {x:15, y:6},
	sw: {x:15, y:6},
	be: {x:15, y:6},
	nl: {x:15, y:6},
	gr: {x:13, y:20},
	no: {x:15, y:6},
	yu: {x:20, y:20},
}
