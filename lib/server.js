// SPDX-License-Identifier: CC-BY-4.0.
/*
  Module for game server communication for:
  https://github.com/uablrek/hex-games/
*/

// Basic logging. Disable with:
//let dbg = function(){}
const log = console.log
let dbg = console.log

const wss = new Map()			// ws->client
const version = 1

// ----------------------------------------------------------------------
// API and help functions

// API functions may us WebSockets, or directed to a local server
export let close = wsClose
export let send = wsSend
export let dieroll = wsDieroll

/*
// The 'client' object:
const client = {
	url:"ws://localhost:8081/ws", // Optional
	cbClose: function(){},		  // Close callback (mandatory)
	cbMessage: function(){},	  // Message callback (mandatory)
	// Set by the lib:
	ws: WbSocket(),
	id:0,						  // 0 until succesful join
}
*/

// Join the server and await reply.
// This is part of the connection handshake. For now, "info" is not
// interpreted, but future contents may include for instance some
// userid/token, game name, etc.
export async function join(client, info) {
	client.id = 0					// Not valid id, but define for logging
	const url = client.url ? client.url : getUrl()
	dbg("Connect to", url)
	if (url == "local") {
		if (!local) {
			local = true
			close = lsClose
			send = lsSend
			dieroll = lsDieroll
		}
		return lsJoin(client, info)
	}
	if (!URL.canParse(url)) return -1
	const ws = new WebSocket(url)
	client.ws = ws
	wss.set(ws, client)				// Add the client to the ws->client map
	ws.onclose = cbClose
	ws.onmessage = cbMessage
	const rc = await new Promise(function(resolve) {
		client.resolve = resolve
	})
	if (rc != 0) return rc
	return call(client, {
		type: "server",
		info: info,
	})	
}
function wsClose(client) {
	if (!client.ws) return -1
	client.ws.close()
	client.ws = null
}
function wsSend(client, msg) {
	client.ws.send(JSON.stringify(msg))
}
// Make a dieroll and await reply
async function wsDieroll(client, die) {
	if (!die) die = "1d6"
	const reply = await call(client, {
		type: "server",
		request: true,
		dieroll: die,
	})
	return reply.dieroll
}

// ----------------------------------------------------------------------
// Local server
// If the URL is "local", a local server is created.
// The intention is to allow a local AI/bot as a player

export let local = false
const lsClients = new Map()
let lsClientId = 0

async function lsJoin(client, info) {
	if (client.id) return -1	// already joined?
	lsClientId++
	client.id = lsClientId
	const c = {
		id: lsClientId,
		client: client,
		info: info,
	}
	lsClients.set(lsClientId, c)
	setTimeout(sendConnected)
	return 0
}
function lsClose(client) {
	lsClients.delete(client.id)
	client.id = 0
	setTimeout(sendConnected)
}
function lsSend(client, msg) {
	msg.from = client.id
	for (const c of lsClients.values()) {
		const cb = c.client.cbMessage.bind(c.client, msg)
		if (msg.to) {
			if (msg.to == c.id) {
				setTimeout(cb)
				return
			}
		} else if (c.id != client.id) {
			setTimeout(cb)
		}
	}
}
async function lsDieroll(client, die) {
	if (!die) die = "1d6"
	const ns = die.split('d')
	const n = Number(ns[0])
	const s = Number(ns[1])
	let sum = 0
	for (let i = 0; i < n; i++) {
		sum += Math.floor(Math.random() * s) + 1
	}
	lsSend(client, {
		type: "server",
		dieroll: sum,
	})
	return sum
}
let connected = new Set()
function sendConnected() {
	const cconn = new Set()
	for (const c of lsClients.values()) {
		if (c.info) cconn.add(c.id)
	}
	// Don't re-send the same status
	// Set equality: https://stackoverflow.com/a/78173058/939955
	if (connected.size === cconn.size && connected.isSubsetOf(cconn))
		return
	connected = cconn
	const msg = {
		type: "server",
		connected: Array.from(connected),
	}
	for (const c of lsClients.values()) {
		const cb = c.client.cbMessage.bind(c.client, msg)
		setTimeout(cb)		
	}
}
// ----------------------------------------------------------------------
// Callbacks. open and error callbacks are redundant

// Close for any reason, e.g. error, or user call
function cbClose(e) {
	const client = wss.get(this)
	log("server.cbClose", client.id)
	wss.delete(client.ws)
	if (client.resolve)
		client.resolve(-1)
	else if (client.cbClose)
		client.cbClose()
}
function cbMessage(e) {
	const client = wss.get(this)
	const msg = JSON.parse(e.data)
	dbg("server.cbMessage", client.id, msg)
	if (msg.type == "server") {
		if (msg.version) {
			// This is the initial server message. It is a response to
			// a succesful open. The join() function awaits resolve
			if (msg.version != version) {
				client.err = `Version: expected ${version}, got ${msg.version}`
				client.resolve(-1)
			} else {
				client.id = msg.client
				client.resolve(0)
			}
			return
		}
		if (msg.join) {
			// This is a reply to a "join" request. It's always
			// accepted for now
			client.resolve(0)
			return
		}
	}
	if (!asyncReturn(client, msg, msg)) client.cbMessage(msg)
}
function asyncReturn(client, msg, rc) {
	// The presence of a resolve function is not enough, since
	// messages other than a reply may arrive at any time.
	if (client.resolve && msg.request) {
		client.resolve(rc)
		delete client.resolve
		delete msg.request
		return true
	}
	return false
}


// ----------------------------------------------------------------------
// Utilities

export function getUrl() {
	let url = ""
	const myUrl = new URL(location.href)
	const param = myUrl.searchParams.get("server")
	if (param) {
		url = param
	} else if (myUrl.protocol != "file:") {
		url = "ws://" + myUrl.host + "/ws"
	}
	return url
}

// Send message and await reply
async function call(client, msg) {
	// The "request" item must be passed back in the reply.
	msg.request = true
	client.ws.send(JSON.stringify(msg))
	return new Promise(function(resolve) {
		client.resolve = resolve
	})
}

function handleServerMessage(client, msg) {
	if (msg.version) {
		// This is the initial server message
		if (msg.version != version) {
			client.err = `Version: expected ${version}, got ${msg.version}`
			client.cbClose()
			return
		}
		client.id = msg.client
		client.cbOpen()
		return
	}
	client.cbMessage(msg)
}
