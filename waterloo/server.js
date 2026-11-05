// SPDX-License-Identifier: CC-BY-4.0.
/*
  Handles remote communication for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import {server, sequence, unit, ui, box} from '@uablrek/hex-games'
import {g, infoBox} from './main.js'
const log = console.log

const client = {
	cbMessage: cbMessage,
	cbClose: cbClose,
}

function cbClose() {
	sequence.jump({}, "connection-failed")
}
function cbMessage(msg) {
	if (msg.type == "server")
		server.handleServerMessage(client, msg, g)
	else
		handlePeerMessage(msg)
}
function updateInfo(key) {
	box.update(infoBox, "Nothing here yet...", key)
}
server.sseq.g = g
server.sseq.client = client
server.sseq.updateInfo = updateInfo
sequence.add(server.sseq)
sequence.add(new sequence.Sequence({
	name: "connection-failed",
	steps: [
		{
			start: function(seq) {
			}
		},
	],
}))


// ----------------------------------------------------------------------
// Peer Communication
function handlePeerMessage(msg) {
	// A message from the other player
	let u
	switch (msg.type) {
	case "nextstep":
		//log("Got nextstep message", g.phase)
		sequence.nextStep()
		break
	}
}
export function sendNextStep() {
	log("sendNextStep")
	sendMsg({type:"nextstep"})
}
export function sendMsg(msg) {
	if (g.mode == "pvp") server.send(client, msg)
}
