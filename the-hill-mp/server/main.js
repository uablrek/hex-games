// SPDX-License-Identifier: CC0-1.0.

import { WebSocketServer } from 'ws';

console.log("Server starting on port 8081...")

const server = new WebSocketServer({ 
	port: 8081 
})

let A
let B

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

server.on('connection', (socket) => {
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
		A.send('{"status":"connected", "player":"French"}')
		B.send('{"status":"connected", "player":"English"}')
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
})


