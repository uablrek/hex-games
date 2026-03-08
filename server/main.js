// SPDX-License-Identifier: CC0-1.0.

import express from 'express'
import expressWs from 'express-ws'

const port = 8081
let A
let B

const app = express()
expressWs(app)
app.use(express.static('html'))
app.ws('/ws', function(ws, req) {
	ws.on('connection', onConnection(ws))
})
app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})

// https://stackoverflow.com/questions/69485407/why-is-received-websocket-data-coming-out-as-a-buffer
function messageFromA(message) {
	if (B) B.send(message.toString())
	console.log(message.toString())
}
function messageFromB(message) {
	if (A) A.send(message.toString())
	console.log(message.toString())
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
