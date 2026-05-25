// SPDX-License-Identifier: CC0-1.0.
/*
  Client module for for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import {sequence} from '@uablrek/hex-games'
import {updatePhase} from "./main.js"

let wsurl
let ws
export let href
export let mode = "sol"	      // sol|pvp|ai
export let waiting = false    // 'waiting' should block the UI
export let side = ''          // A|B|''. '' means not connected
export let nat = ''           // fr|al|''
export let natChanged = false // For side B the nat may change

function openConnection() {
	ws = new WebSocket(wsurl)
	ws.onclose = retryConnection
	ws.onerror = retryConnection
	ws.onmessage = handleConnectMessage
}
function retryConnection() {
	ws = null
	setTimeout(openConnection, 2000)
}
function handleConnectMessage(_msg) {
	// This should be a json-status message
	let msg = JSON.parse(_msg.data)
	if (msg.status != "connected") return
	if (!side) {
		side = msg.player
		console.log(`connected as ${side}`)
		if (side == 'A' && mode == "pvp") {
			// Wait for the other player
			sequence.nextStep()
			return
		}
	}
	// Either we have just one player, or both players are connected
	// in PvP mode
	ws.onclose = brokenConnection
	ws.onerror = brokenConnection
	ws.onmessage = handlePeerMessage
	sequence.nextStep()
}
function handlePeerMessage(_msg) {
	// A message from the other player
	let msg = JSON.parse(_msg.data)
	console.log("Peer message", msg)
	let u
	switch (msg.type) {
	case "faction":
		// Only side B should get this message. It will assign the
		// nat that side A has not taken
		if (nat != msg.nat) {
			nat = msg.nat
			natChanged = true
		}
		sequence.nextStep()
		break
	}
}
function brokenConnection() {
	side = ''
	ws = null
	alert("The connection was broken. Please reload the page")
}
function sendMsg(msg) {
	ws.send(JSON.stringify(msg))
}

// ----------------------------------------------------------------------
sequence.add(new sequence.Sequence({
	name: "server-connect",
	steps: [
		{
			//name: init,
			start: function(seq) {
				href = new URL(location.href)
				// Only stand-alone is available for local (file:) loads
				if (href.protocol != "file:") wsurl = `ws://${href.host}/ws`

				const param = href.searchParams.get("mode")
				if (param) {
					// Set mode and nat. Unknown modes should be
					// handled as "sol" by the main program
					const m = param.split('-')
					mode = m[0]
					const arg = m.length > 1 ? m[1] : ''
					if (mode == "ai" || mode == "pvp") {
						nat = "fr" // invaldid/unknown will become "fr"
						if (arg == "al") nat = "al"
					}
				}
				// Connect to server only in pvp mode
				if (mode != "pvp")
					sequence.back(seq)
				else {
					if (wsurl)
						seq.nextStep()						
					else {
						// PvP requires a server. Resort to "sol"
						mode = "sol"
						sequence.back(seq)
					}
				}
			},
		},
		{
			// From now on we *know* that mode == "pvp"
			name: "Connect to Server",
			start: function(seq) {
				waiting = true
				openConnection()
				updatePhase(seq)
			}
		},
		{
			name: "Waiting for other player",
			start: function(seq) {
				if (side == 'A')
					updatePhase(seq)
				else
					seq.nextStep()
			}
		},
		{
			start: function(seq) {
				if (ws) {
					if (side == 'A') {
						// Only side A may select faction. Side B will
						// get the other faction, whatever was requested
						const onat = nat == "fr" ? "al" : "fr"
						sendMsg({type: "faction", nat: onat})
						sequence.back(seq)
					}
				} else
					// TODO: test this (how? why?)
					seq.gotoStep("Connect to Server")
			}
		},
		{
			// Only side B get's here when the "faction" message is received
			start: sequence.back,
		},
	],
}))
