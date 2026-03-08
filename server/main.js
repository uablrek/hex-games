// SPDX-License-Identifier: CC0-1.0.

import express from 'express'
import expressWs from 'express-ws'
import fs from 'fs'

const port = 8081
let A
let B
let log = console.log
//let log = functio(){}

const saved = "saves"
if (!fs.existsSync(saved)) fs.mkdirSync(saved)

const app = express()
expressWs(app)
app.use(express.static('html'))
app.ws('/ws', function(ws, req) {
	ws.on('connection', onConnection(ws))
})
app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
let saves = {}

// Saves are stored at the server. Message format:
//   {"type":"save", "name":"save-name", "game": {...}}
//   {"type":"restore", "name":"save-name", "game": {...}}
// The "game" object may be anything, and is omitted in a restore request.
function isSaveRestore(message) {
	const msg = JSON.parse(message)
	if (msg.type == "save") {
		saves[msg.name] = msg.game
		const savef = `${saved}/${msg.name}`
		fs.writeFileSync(savef, JSON.stringify(msg.game))
		log("Game saved", message)
		return true
	}
	if (msg.type == "restore") {
		if (msg.name in saves)
			msg.game = saves[msg.name]
		else {
			const savef = `${saved}/${msg.name}`
			if (fs.existsSync(savef)) {
				const data = fs.readFileSync(savef, 'utf8')
				saves[msg.name] = JSON.parse(data)
				msg.game = saves[msg.name]
			}
		}
		const reply = JSON.stringify(msg)
		if (A) A.send(reply)
		if (B) B.send(reply)
		log("Game restored", reply)
		return true
	}
	return false
}

// https://stackoverflow.com/questions/69485407/why-is-received-websocket-data-coming-out-as-a-buffer
function messageFromA(message) {
	const msg = message.toString()
	if (isSaveRestore(msg)) return
	if (B) B.send(msg)
	log(msg)
}
function messageFromB(message) {
	const msg = message.toString()
	if (isSaveRestore(msg)) return
	if (A) A.send(msg)
	log(msg)
}
function closeA() {
	A = null
	if (B) {
		B.send('{"status":"disconnected"}')
		B.close()
		B = null
	}
}
function closeB() {
	B = null
	if (A) {
		A.send('{"status":"disconnected"}')
		A.close()
		A = null
	}
}
function onConnection(socket) {
	if (A && B) {
		socket.send('{"status":"busy"}')
		socket.close()
		return
	}
	if (A) {
		B = socket
		B.on('message', messageFromB)
		B.on('close', closeB)
		B.on('error', closeB)		
		A.send('{"status":"connected", "player":"A"}')
		B.send('{"status":"connected", "player":"B"}')
	} else {
		A = socket
		A.on('message', messageFromA)
		A.on('close', closeA)
		A.on('error', closeA)
		A.send('{"status":"waiting"}')
	}
	socket.addEventListener('error', error => {
		console.error('WebSocket error:', error)
	})
}
