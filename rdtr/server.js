// SPDX-License-Identifier: CC-BY-4.0.
/*
  Handles remote communication for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
*/

import {server, sequence, unit, ui} from '@uablrek/hex-games'
import {g, setChoice} from './game.js'
import {updateInfo} from './main.js'
import * as map from './map.js'
const dbg = function(){}
const log = console.log

sequence.add(new sequence.Sequence({
	name: "server",
	steps: [
		{
			start: function(seq) {
				// AI, server or solitarie?
				const myUrl = new URL(location.href)
				const param = myUrl.searchParams.get("ai")
				if (param) {
					g.mode = "ai"
					ai.player(param)
					g.me = (ai.me == "Allies" ? "Axis" : "Allies")
				} else if (server.getUrl()) {
					g.mode = "pvp"
				}
				if (g.mode != "pvp") {
					sequence.back(seq)
					return
				}
				seq.nextStep()
			}
		},
		{
			name: "Connect to Server",
			start: function(seq) {
				client.url = server.getUrl()
				updateInfo(`\n\nServer URL: ${client.url}`)
				server.join(client, {}).then(sequence.nextStep)
			},
		},
		{
			name: "Connect Result",
			start: function(seq) {
				if (!client.id) {
					connectRetry(seq, 5)
					return
				}
				dbg("Connected as client:", client.id)
				seq.nextStep()
			}
		},
		{
			name: "Waiting for other player",
			start: function(seq) {
				g.me = "None"	// no side is active. Disables the UI
				updateInfo()
			}
		},
		{ start: sequence.back },
	]
}))

function connectRetry(seq, delay) {
	if (delay) {
		let txt = `\n\nFailed connect to ${client.url}\n\n` +
			`Retry in ${delay} seconds...`
		updateInfo(txt)
		setTimeout(connectRetry, 1000, seq, delay - 1)
	} else {
		seq.gotoStep("Connect to Server")
	}
}

// ----------------------------------------------------------------------
// Communication

const client = {
	cbMessage: cbMessage,
	cbClose: cbClose,
}

function cbClose() {
	me = ''
	sequence.jump({}, "connection-failed")
}
function cbMessage(msg) {
	dbg("cbMessage", msg)
	if (msg.type == "server")
		handleServerMessage(msg)
	else
		handlePeerMessage(msg)
}

function handleServerMessage(msg) {
	if (msg.version) {
		// This is the first message from the server
		return
	}
	if (msg.connected) {
		// We got an array of connected clients. Either a player has
		// connected, or a player has left the server. Sort the array,
		// first id is Axis, second is Allies, the rest are
		// "observers"
		if (g.me && g.me != "None") {
			// Another player has left the game. It *might* be an
			// observer, but we assume it's the other player
			g.me = 'None'
			sequence.jump({}, "connection-failed")
			return
		}
		// A player has connected to the server (it may be ourselves)
		if (msg.connected.length < 2) return
		msg.connected.sort(function (a,b) {return a - b})
		if (client.id == msg.connected[0]) {
			g.me = "Axis"
		} else if (client.id == msg.connected[1]) {
			g.me = "Allies"
		}
		sequence.nextStep()
		return
	}
}
function handlePeerMessage(msg) {
	// A message from the other player
	let u
	switch (msg.type) {
	case "nextstep":
		//log("Got nextstep message", g.phase)
		sequence.nextStep()
		break
	case "deployment":
		for (const uh of msg.units) {
			unit.place(uh, ui.board)
		}
		break
	case "move":
		u = unit.units[msg.i]
		if (!map.isVisible(msg.hex)) {
			map.center(msg.hex)
			setTimeout(unit.moveTo, 300, u, msg.hex)
			return
		}
		unit.moveTo(u, msg.hex)
		break
	case "removeunit":
		u = unit.units[msg.i]
		if (!map.isVisible(u.hex)) map.center(u.hex)
		unit.remove(u)
		break
	case "choice":
		setChoice(msg.value)
		break
	case "skipsequence":
		sequence.back(sequence.currentSequence())
		break
	case "control":
		g.Axis = new Set(msg.Axis)
		g.Allies = new Set(msg.Allies)
		if (msg.deploy) {
			// We are in step player/DoW
			sequence.currentSequence().deploy = msg.deploy
			sequence.nextStep()
		}
	}
}
export function sendPlayerDeployment() {
	let msg = {type: "deployment", units: []}
	for (const u of units) {
		if (u.nat != g.nat) continue
		if (!u.hex) continue
		msg.units.push({i:u.i, hex:u.hex})
	}
	sendMsg(msg)
}
export function sendNextStep() {
	log("sendNextStep")
	sendMsg({type:"nextstep"})
}
export function sendMsg(msg) {
	if (g.mode == "pvp") server.send(client, msg)
}

