// SPDX-License-Identifier: CC0-1.0.
// A websocket server that relays messages between clients.
// This is a minimalistic server intended for games, but it is generic.

// Express-ws (https://github.com/HenningM/express-ws) seem to be
// unmaintained, the used version, 5.0.2 was released 2021. But it's a
// thin wrapper for "ws" which is well maintained.
import express from 'express'
import expressWs from 'express-ws'

// The protocol version
const version = 1

// Basic logging. Disable with:
//let dbg = function(){}
const log = console.log
let dbg = function(){}

const clients = new Map()
let clientId = 0

// Setup server
// The server serves ws:// requests on "/ws" and publish static content
// from the "html/" directory
let port = process.env.PORT
if (!port) port = 8081
const app = express()
app.use(express.static('html'))
expressWs(app)
app.listen(port, () => {
	log("Server listening on port", port)
})
app.ws('/ws', function(ws, req) {
	ws.on('connection', cbConnection(ws))
})
function cbConnection(ws) {
	clientId++
	log("Client connect", clientId)
	const client = {
		ws: ws,
		id: clientId,
	}
	clients.set(ws, client)
	ws.on('message', cbMessage)
	ws.on('close', cbClose)
	const msg = {
		type: "server",
		version: version,
		client: clientId,
	}
	send(client, msg)
}
function cbMessage(message) {
	const client = clients.get(this)
	const msg = JSON.parse(message.toString())
	log("Got message", msg, "from client", client.id)
	if (msg.type == "server") {
		serverMsg(client, msg)
		return
	}
	// Peer messages are relayed to all connected clients with an
	// "info" object, except the sending client
	msg.from = client.id
	const jsonMsg = JSON.stringify(msg)
	for (const c of clients.values()) {
		if (c.id == client.id) continue
		if (!c.info) continue
		c.ws.send(jsonMsg)
	}
}
function cbClose() {
	const client = clients.get(this)
	clients.delete(this)
	log("Close, client", client.id)
	sendConnected()
}
function send(client, msg) {
	dbg("Send", client.id, msg)
	client.ws.send(JSON.stringify(msg))
}
// Handle message to the server
function serverMsg(client, msg) {
	if (msg.info) {
		// This is part of the connection handshake. The "info" object
		// is stored in the client object, but the content is yet not
		// interpreted.
		client.info = msg.info
		// The client awaits a reply
		send(client, {
			type: "server",
			// TODO: something useful, e.g. check accept/reject ...
			join: "accepted",
		})
		sendConnected()			// Update connection state
		return
	}
	if (msg.dieroll) {
		dieroll(client, msg)
		return
	}
}
// Send connected update whenever a client is added or removed
function sendConnected() {
	const connected = []
	for (const c of clients.values()) {
		if (c.info) connected.push(c.id)
	}
	sendToAll({
		type: "server",
		connected: connected,
	})
}
function sendToAll(msg) {
	const jsonMsg = JSON.stringify(msg)
	for (const c of clients.values()) {
		if (c.info) c.ws.send(jsonMsg)
	}
}

// ----------------------------------------------------------------------
// Die-roll

function dieroll(client, msg) {
	msg.dieroll = rollDie(msg.dieroll)
	// Send the reply to the calling client
	send(client, msg)
	// Send the dieroll to all other clients, but not as a reply
	delete msg.request
	msg.from = client.id
	const jsonMsg = JSON.stringify(msg)
	for (const c of clients.values()) {
		if (c.info && c.id != client.id) c.ws.send(jsonMsg)
	}
}
function rollDie(die) {
	if (!die) die = "1d6"
	const ns = die.split('d')
	const n = Number(ns[0])
	const s = Number(ns[1])
	let sum = 0
	for (let i = 0; i < n; i++) {
		sum += Math.floor(Math.random() * s) + 1
	}
	return sum
}
