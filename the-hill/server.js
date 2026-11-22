// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the server module for:
  https://github.com/uablrek/hex-games/tree/main/the-hill
*/

import Konva from 'konva'
import {sequence, server, unit, ui, map} from '@uablrek/hex-games'
import {g, handleMessage} from './game.js'
import * as game from './game.js'
import {updateInfo} from './main.js'

const client = {
	cbMessage: cbMessage,
	cbClose: cbClose,
}

export function init() {
	sequence.add(server.sseq)
}

function cbClose() {
	g.me = ''
	sequence.jump({}, "connection-failed")
}
function cbMessage(msg) {
	if (msg.type == "server")
		server.handleServerMessage(client, msg, g)
	else
		handleMessage(msg)		// (in game.js)
}

export function sendPlayerDeployment() {
	let msg = {type: "deployment", units: []}
	for (const u of g.units) {
		if (u.nat != g.nat) continue
		if (!u.hex) continue
		msg.units.push({i:u.i, hex:u.hex})
	}
	sendMsg(msg)
}
export function sendNextStep() {
	sendMsg({type:"nextstep"})
}
export function sendMsg(msg) {
	if (g.mode == "pvp") server.send(client, msg)
}

// ----------------------------------------------------------------------
// Sequences

sequence.add(new sequence.Sequence({
	name: "server",
	steps: [
		{
			start: function(seq) {
				sequence.jump(seq, "server.seq", {
					g: g,
					client: client,
					updateInfo: updateInfo,
				})
			}
		},
		{
			start: sequence.back,
		},
	],
}))


sequence.add(new sequence.Sequence({
	name: "connection-failed",
	steps: [
		{
			name: "Lost Contact",
			start: function(seq) {
				ui.clearKeys()
				updatePhase(seq)
			}
		},
	],
}))
