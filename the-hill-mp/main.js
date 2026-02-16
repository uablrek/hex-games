// SPDX-License-Identifier: CC0-1.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/the-hill

  This file contains the game setup, and the sequences.
*/

import Konva from 'konva'
import {setup, grid, box, unit, sequence, rdata, map} from './hex-games.js'
import mapData from './example-map.svg'
import crtData from './crt.svg'
import mapProperties from './map-data.json'

let board
let crt
let me
let attackerFactorsToRemove = 0
let defenderFactorsToRemove = 0

const keyFn = [
	{key:'h', fn:createHelpBox},
	{key:' ', fn: rotateStack},
	{key:'Enter', fn:nextStep },
	{key:'x', fn:nextStep },
	{key: 'r', fn:regretMove },
	{key:'a', fn:attack},
]
setup.setKeys(keyFn)

function rotateStack(e) {
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	unit.rotateStack(hex)
}
function nextStep(e) {
	if (!me || me != g.player) return
	if (attackerFactorsToRemove > 0) {
		alert(`Attacker have ${attackerFactorsToRemove} factors to remove`)
		return
	}
	if (defenderFactorsToRemove > 0) {
		alert(`Defender have ${defenderFactorsToRemove} factors to remove`)
		return
	}
	sequence.nextStep()
}
function regretMove() {
	if (g.player != me) return
	if (g.phase != "Movement") return
	if (!selectedUnit) return
	unit.regretMove(selectedUnit)
	sendMsg({type: "regret", i:selectedUnit.i})
}
function boardOnClick(e) {
	if (!me || me != g.player) return
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	let h = map.getHex(hex)
	if (h && g.phase == "Movement") moveSelectedUnit(h)
}
function unitClick(e) {
	if (!me) return
	if (attackerFactorsToRemove > 0) {
		if (g.player != me) return
		const u = unit.fromImg(e.target)
		if (!attackers.has(u)) return
		u.img.remove()
		map.removeUnit(u)
		sendMsg({type:"removeunit", i:u.i})
		attackerFactorsToRemove -= u.s
		if (attackerFactorsToRemove <= 0) {
			exDone()
			sendMsg({type:"exdone"})
		}
	}
	if (defenderFactorsToRemove > 0) {
		if (g.player == me) return
		const u = unit.fromImg(e.target)
		if (!targetHex.units.has(u)) return
		u.img.remove()
		map.removeUnit(u)
		sendMsg({type:"removeunit", i:u.i})
		defenderFactorsToRemove -= u.s
		if (defenderFactorsToRemove <= 0) {
			exDone()
			sendMsg({type:"exdone"})
		}
	}
	if (me != g.player) return
	if (g.phase == "Movement") {
		movementClick(e)
		return
	}
	if (g.phase == "Combat") {
		combatUnitClick(e)
		return
	}
}

// ----------------------------------------------------------------------
// Websocket related
let ws
let url

function openConnection(_url) {
	url = _url
	ws = new WebSocket(url)
	ws.onclose = retryConnection
	ws.onerror = retryConnection
	ws.onmessage = handleConnectMessage
	updateTurnBox("Connecting...")
}
function retryConnection() {
	ws = null
	status = null
	setTimeout(openConnection, 2000, url)
}
function handleConnectMessage(_msg) {
	// This should be a json-status message. These are the only
	// messages sent by the server itself
	let msg = JSON.parse(_msg.data)
	if (msg.status != "connected") {
		updateTurnBox(`Status: ${msg.status}`)
		return
	}
	me = msg.player
	g.player = "English"
	updateTurnBox(`You are playing as: ${me}`)
	ws.onclose = brokenConnection
	ws.onerror = brokenConnection
	ws.onmessage = handlePeerMessage
	sequence.nextStep()
}
function handlePeerMessage(_msg) {
	// A message from the other player
	let msg = JSON.parse(_msg.data)
	let u
	switch (msg.type) {
	case "nextstep":
		sequence.nextStep()
		break
	case "deployment":
		for (const uh of msg.units) {
			console.log(uh)
			unit.place(uh, board)
		}
		break
	case "move":
		u = units[msg.i]
		unit.moveTo(u, msg.hex)
		selectedUnit = u
		break
	case "regret":
		unit.regretMove(selectedUnit)
		break
	case "target":
		removeTargetMarker()
		unsetAttackers()
		targetHex = map.getHex(msg.hex)
		setTargetMarker(targetHex)
		break
	case "addattacker":
		addAttacker(units[msg.i])
		break
	case "attack":
		computeOdds(msg.die)	// (just to update CRT)
		if (msg.outcome == "DE") {
			removeDefenders()
			unsetAttackers()
		} else if (msg.outcome == "AE") {
			removeAttackers()
			removeTargetMarker()
		} else {
			handleEX(msg.a, msg.d)
		}
		break
	case "removeunit":
		u = units[msg.i]
		u.img.remove()
		map.removeUnit(u)
		break
	case "exdone":
		exDone()
		break
	}
}
function brokenConnection() {
	me = null
	ws = null
	alert("The connection was broken. Please reload the page")
}
function sendPlayerDeployment() {
	let msg = {type: "deployment", units: []}
	for (const u of units) {
		if (u.nat != g.nat) continue
		if (!u.hex) continue
		msg.units.push({i:u.i, hex:u.hex})
	}
	ws.send(JSON.stringify(msg))
}
function sendNextStep() {
	ws.send('{"type":"nextstep"}')
}
function sendMsg(msg) {
	ws.send(JSON.stringify(msg))
}

// ----------------------------------------------------------------------
// Game related
export let theGame = {
	turn: {h:10, m:0},
	player: '',
	phase: '',
	nat: '',
	winner: '',
}
let g = theGame
// Returns false at end-of-game
function stepTurn() {
	if (g.turn.m >= 45) {
		g.turn.m = 0
		g.turn.h++
	} else
		g.turn.m += 15
	return g.turn.h < 12
}
let objectives = new Set()
function checkFrenchVictory() {
	let occupied = 0
	for (const h of objectives) {
		if (h.units) {
			for (const u of h.units) {
				if (u.nat == 'fr') occupied++
				break
			}
		}
	}
	return occupied == 3
}

// ----------------------------------------------------------------------
// Sequences

function updatePhase(seq) {
	g.phase = seq.currentStep.name
	updateTurnBox()
}

// This is the top sequence
sequence.add(new sequence.Sequence({
	name: "game",
	steps: [
		{
			name: "Connect to Server",
			start: function(seq) {
				openConnection('ws://localhost:8081')
			},
		},
		{
			name: "English Deployment",
			start: function(seq) {
				g.player = "English"
				g.nat = 'en'
				updatePhase(seq)
				if (g.player == me)
					deployEnglish()
				else
					seq.nextStep()
			},
			end: function(seq) {
				if (unitBox) unitBox.destroy()
			}
		},
		{
			name: "Validate English Deployment",
			start: function(seq) {
				if (g.player == me) {
					if (validDeployment()) {
						sendPlayerDeployment()
						sendNextStep()
						seq.nextStep()
					} else
						seq.gotoStep("English Deployment")
				}
			},
		},
		{
			name: "French Deployment",
			start: function(seq) {
				g.player = "French"
				g.nat = 'fr'
				updatePhase(seq)
				if (g.player == me)
					deployFrench()
				else
					seq.nextStep()
			},
			end: function(seq) {
				if (unitBox) unitBox.destroy()
			}
		},
		{
			name: "Validate French Deployment",
			start: function(seq) {
				if (g.player == me) {
					if (validDeployment()) {
						sendPlayerDeployment()
						sendNextStep()
						seq.nextStep()
					} else
						seq.gotoStep("French Deployment")
				}
			},
		},
		{
			name: "Prepare",
			start: function(seq) {
				for (const u of units)
					u.img.on('click', unitClick)
				seq.nextStep()
			}
		},
		{
			name: "French Turn",
			start: function(seq) {
				g.player = "French"
				g.nat = 'fr'
				sequence.jump(seq, "player")
			}
		},
		{
			name: "English Turn",
			start: function(seq) {
				g.player = "English"
				g.nat = 'en'
				sequence.jump(seq, "player")
			},
		},
		{
			name: "Check Winner",
			start: function(seq) {
				// If all objectives are occupied by French units,
				// France wins
				if (checkFrenchVictory()) {
					g.winner = "France"
					seq.gotoStep("Declare Winner")
				} else
					seq.nextStep()
			}
		},
		{
			name: "Step Turn",
			start: function(seq) {
				if (stepTurn())
					seq.gotoStep("French Turn")
				else
					seq.nextStep()
			}
		},
		{
			name: "Declare Winner",
			start: function(seq) {
				g.player = 'England'
				if (g.winner == "France") g.player = "France"
				updatePhase(seq)
			}
		},
		{
			name: "End of Game",
			start: updatePhase,
		},
	],
}), true)

sequence.add(new sequence.Sequence({
	name: "player",
	steps: [
		{
			name: "Movement",
			start: function(seq) {
				updatePhase(seq)
				recomputeZOC()
			},
			end: function(seq) {
				for (const u of units) {
					if (u.nat != g.nat) continue
					unit.removeMark1(u)
					u.ohex = null
				}
				removeMarkers()
				if (g.player == me) sendNextStep()
			}
		},
		{
			name: "Combat",
			start: function(seq) {
				updatePhase(seq)
				board.add(crt)
				for (const u of units) u.hasAttacked = false
			},
			end: function(seq) {
				crtMarker.remove()
				crt.remove()
				removeTargetMarker()
				unsetAttackers()
				if (g.player == me) sendNextStep()
			},
		},
		{
			name: "Proceed turn",
			start: sequence.back
		},
	],
}))


// ----------------------------------------------------------------------
// Units

const nations = {
	fr: {color: 'lightblue'},
	en: {color: '#cc4444'},
}

const units = [
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'1', s:4, m:4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'2', s:4, m:4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'3', s:4, m:4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'4', s:4, m:4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'5', s:4, m:4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'6', s:4, m:4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'7', s:4, m:4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'8', s:4, m:4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'9', s:4, m:4},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'10', s:4, m:4},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'1', s:3, m:6},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'2', s:3, m:6},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'3', s:3, m:6},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'4', s:3, m:6},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'5', s:3, m:6},
	{nat:'fr', type:'art', stat: "6-2", sz:'II', lbl:'1', s:6, m:2},
	{nat:'fr', type:'art', stat: "6-2", sz:'II', lbl:'2', s:6, m:2},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'1', s:3, m:4},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'2', s:3, m:4},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'3', s:3, m:4},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'4', s:3, m:4},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'5', s:3, m:4},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'6', s:3, m:4},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'7', s:3, m:4},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'8', s:3, m:4},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'9', s:3, m:4},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'10', s:3, m:4},
	{nat:'en', type:'cav', stat: "3-6", sz:'II', lbl:'1', s:3, m:6},
	{nat:'en', type:'cav', stat: "3-6", sz:'II', lbl:'2', s:3, m:6},
]

let unitBox
function deployEnglish() {
	unitBox = new unit.UnitBox({
		text: "Eng",
		cols: 2,
		//mustBeEmpty: true,
		unitTypes: [
			{type:'inf', stat: "3-4"},
			{type:'cav', stat: "3-6"},
		],
		destroyCallback: (ub) => unitBox = null,
	})
	for (const u of units) {
		if (u.nat != 'en') continue
		if (u.hex) continue
		unitBox.addUnit(u)
	}
	unitBox.box.position({x:400,y:200})
	board.add(unitBox.box)
}
function deployFrench() {
	unitBox = new unit.UnitBox({
		text: "Fr",
		cols: 3,
		//mustBeEmpty: true,
		unitTypes: [
			{type:'inf', stat: "4-4"},
			{type:'cav', stat: "3-6"},
			{type:'art', stat: "6-2"},
		],
		destroyCallback: (ub) => unitBox = null,
	})
	for (const u of units) {
		if (u.nat != 'fr') continue
		if (u.hex) continue
		unitBox.addUnit(u)
	}
	unitBox.box.position({x:800,y:400})
	board.add(unitBox.box)
}
// Side-effect: if the deployment is valid all deployed units will
// become "un-draggable"
function validDeployment() {
	let nat, prop, ret=true
	if (g.player == "English") {
		nat = 'en'
		prop = 'b'
	} else {
		nat = 'fr'
		prop = 'a'
	}
	for (const u of units) {
		if (u.nat != nat) continue
		if (!u.hex) continue
		let h = map.getHex(u.hex)
		if (!h || !h.prop || !h.prop.includes(prop) || h.units.size > 2) {
			map.removeUnit(u)
			u.img.remove()
			ret=false
		}
	}
	// If valid, make "un-draggable"
	if (ret) {
		for (const u of units) {
			if (u.nat != nat) continue
			u.img.off('dragstart')
			u.img.off('dragend')
			u.img.draggable(false)
		}
	}
	return ret
}

// ----------------------------------------------------------------------
// Boxes

function boxDestroy(box) {
	if (box == theHelpBox) {
		theHelpBox = null
		return
	}
}
box.destroyCallback(boxDestroy)

let theHelpBox
function createHelpBox() {
	const helpTxt =
		  'Attack from river, or up-slope is halved. ' +
		  'Defence in forrest is doubled\n\n' +
		  'h - This help\n' +
		  'Enter,x - Next phase\n' +
		  'r - Regret move\n' +
		  'a - Attack\n' +
		  'Space - Rotate Stack\n'
	if (theHelpBox) return
	theHelpBox = box.info({
		x: 400,
		y: 200,
		width: 300,
		label: "Help",
		text: helpTxt,
	})
	board.add(theHelpBox)
}
let theTurnBox
function createTurnBox() {
	if (theTurnBox) return
	theTurnBox = box.info({
		x: 800,
		y: 100,
		width: 400,
		height: 160,
		destroyable: false,
	})
	updateTurnBox()
	board.add(theTurnBox)
}
function updateTurnBox(info) {
	if (!theTurnBox) return
	let m = String(g.turn.m).padStart(2, '0')
	let str = `April 6 1806, ${g.turn.h}:${m}\n`
	str += `Player: ${me}\n`
	str += `Current player: ${g.player}\nPhase: ${g.phase}\n`
	if (info) str += info
	box.update(theTurnBox, str)
}

// ----------------------------------------------------------------------
// Movement

function removeD() {
	for (const h of map.hexMap.values()) delete h.d
}
function blocked(h, n, i) {
	if (!n.prop) return false
	return n.prop.includes('x')
}
function getMovementCost(h,n,i,u) {
	if (n.units && n.units.size > 0) {
		// The hex is uccupied
		for (const u of n.units)
			if (u.nat != g.nat) return 100 // enemy
		// stacking limit is 2
		if (n.units.size >= 2) return 100
	}
	let zoc = 0
	if (h.zoc && n.zoc) zoc = 3
	if (n.prop) {
		if (n.prop.includes('w')) return 100
		if (n.prop.includes('f')) {
			if (u.type == 'cav') return 3
			if (u.type == 'art') return 100
			return 2
		}
		if (n.prop.includes('m')) {
			if (u.type == 'cav' || u.type == 'art') return 100
			return 3
		}
	}
	if (h.prop && h.prop.includes('r')) return 2 + zoc
	if (h.edges && h.edges.charAt(i) == 'u') return 3 + zoc
	return 1
}
grid.mapFunctions(map.getAxial, blocked, getMovementCost, removeD)

const marker = new Konva.Circle({
	radius: 6,
    fill: "lightgreen",
    stroke: 'lightgray',
    stroke_width: 1
})
let markers
function setMarker(h) {
	if (!markers) {
		markers = new Konva.Group()
		board.add(markers)
	}
	let pos = grid.hexToPixel(h.hex)
	
	markers.add(marker.clone({
		position: pos,
	}))
}
function removeMarkers() {
	allowedHexes = null
	if (markers) {
		markers.destroy()
		markers = null
	}
}

let selectedUnit
let allowedHexes
function movementClick(e) {
	let u = unit.fromImg(e.target)
	let h = map.getHex(u.hex)
	// Check if this click i a movement-click (not a unit-select click)
	if (allowedHexes && allowedHexes.has(h)) return
	removeMarkers()				// (clears allowedHexes)
	selectedUnit = u
	if (u.nat != g.nat) return	// Other's movement phase
	if (u.ohex) return			// Has already moved
	allowedHexes = grid.movementAxial(u.m, grid.hexToAxial(u.hex), u)
	for (const h of allowedHexes) setMarker(h)
}
function moveSelectedUnit(h) {
	if (!selectedUnit || !allowedHexes) return
	if (!allowedHexes.has(h)) return
	removeMarkers()
	selectedUnit.img.moveToTop()
	unit.moveTo(selectedUnit, h.hex)
	const msg = {type: "move"}
	msg.i = selectedUnit.i
	msg.hex = h.hex
	sendMsg(msg)
}
function recomputeZOC() {
	for (const h of map.hexMap.values()) h.zoc = false
	for (const u of units) {
		if (u.nat == g.nat) continue
		if (!u.hex) continue
		const h = map.getHex(u.hex)
		for (n of grid.neighboursAxial(h.ax)) {
			if (n) n.zoc = true
		}
	}
}

// ----------------------------------------------------------------------
// Combat
const targetMarkerTemplate = new Konva.Group()
targetMarkerTemplate.add(new Konva.Circle({
	radius: 20,
    stroke: 'white',
}))
targetMarkerTemplate.add(new Konva.Path({
    stroke: 'white',
	data: "M 0 -20 l 0 10 m 0 20 l 0 10 M -20 0 l 10 0 m 20 0 l 10 0",
}))
let targetMarker
function setTargetMarker(h) {
	let pos = grid.hexToPixel(h.hex)
	if (!targetMarker) {
		targetMarker = targetMarkerTemplate.clone()
		targetMarker.position(pos)
		board.add(targetMarker)
	} else
		targetMarker.position(pos)
	crtMarker.remove()
	if (g.player == me) sendMsg({type: "target", hex: h.hex})
}
function removeTargetMarker() {
	if (targetMarker) {
		targetMarker.destroy()
		targetMarker = null
	}
	targetHex = null
}

let targetHex
let attackers = new Set()
function combatUnitClick(e) {
	let u = unit.fromImg(e.target)
	let h = map.getHex(u.hex)
	if (u.nat != g.nat) {
		removeTargetMarker()
		unsetAttackers()
		setTargetMarker(h)
		targetHex = h
	} else {
		if (!targetHex) return
		if (u.hasAttacked) return
		// Units have range 1, except artillery which have 2
		let d = grid.axialDistance(targetHex.ax, h.ax)
		if (d <= 1 || u.type == 'art' && d <= 2) addAttacker(u)
	}
}
function addAttacker(u) {
	attackers.add(u)
	unit.addMark1(u, 'red')
	computeOdds()
	if (g.player == me) sendMsg({type: "addattacker", i: u.i})
}
function unsetAttackers() {
	for (const u of attackers) unit.removeMark1(u)
	attackers.clear()
}
function isUpslope(hex, target) {
	let h = map.getHex(hex)
	if (!h.edges) return
	if (grid.axialDistance(h.ax, target.ax) > 1) return false
	let neighbours = grid.neighboursAxial(h.ax)
	let i
	for (i = 0; i < 6; i++)
		if (neighbours[i] == target) break
	return h.edges.charAt(i) == 'u'
}
function isRiver(hex) {
	let h = map.getHex(hex)
	return h.prop && h.prop.includes('r')
}

let crtMarker = new Konva.Circle({
	stroke: 'red',
	radius: 16,
})
function updateCrt(x, die=0) {
	if (x > 5) x = 5
	if (x < 0) x = 0
	let pos = {x:x * 60 + 26, y:die*24+12}
	crtMarker.position(pos)
	if (!crtMarker.getParent())
		crt.add(crtMarker)
}
const ctrMatrix = [
	['AE','AE','AE','AE','EX','EX'],
	['AE','AE','AE','EX','EX','DE'],
	['AE','AE','EX','EX','DE','DE'],
	['AE','EX','EX','DE','DE','DE'],
	['EX','EX','DE','DE','DE','DE'],
	['EX','DE','DE','DE','DE','DE'],
]
function computeOdds(die=0) {
	let a = 0, d = 0
	for (const u of attackers) {
		if (isUpslope(u.hex, targetHex) || isRiver(u.hex))
			a += (u.s/2)
		else
			a += u.s	
	}
	for (const u of targetHex.units) d += u.s
	if (targetHex.prop && targetHex.prop.includes('f')) d = d * 2
	let x = 2
	if (a >= d)
		x += (Math.floor(a/d) - 1)
	else
		x -= (Math.ceil(d/a) - 1)
	updateCrt(x, die)
	if (die == 0) return ''
	if (x < 0) return 'AE'
	if (x > 5) return 'DE'
	return ctrMatrix[die-1][x]
}
function attack() {
	if (g.player != me) return
	if (!targetHex || attackers.size == 0) return
	for (const u of attackers) u.hasAttacked = true
	let die = Math.floor(Math.random() * 6) + 1
	let outcome = computeOdds(die)
	// TODO: send to server
	if (outcome == "EX") {
		// We must find the lowest factors, defender or attacker,
		// remove them, and remove their markers. Then make so a click
		// removes a unit, while disabling just about everything else.
		let a = 0, d = 0
		for (const u of targetHex.units) d += u.s
		for (const u of attackers) a += u.s
		if (g.player == me) {
			const msg = {type:"attack", die: die, outcome: "EX"}
			msg.a = a
			msg.d = d
			sendMsg(msg)
		}
		handleEX(a, d)
		return
	}
	if (outcome == "DE") {
		removeDefenders()
		unsetAttackers()
	} else {
		removeAttackers()
		removeTargetMarker()
	}
	if (g.player == me) sendMsg({type:"attack", die: die, outcome: outcome})
}
function removeDefenders() {
	for (const u of targetHex.units) {
		u.img.remove()
		map.removeUnit(u)
	}
	removeTargetMarker()
}
function removeAttackers() {
	for (const u of attackers) {
		u.img.remove()
		map.removeUnit(u)
	}
	unsetAttackers()
}
function handleEX(a, d) {
	if (Math.abs(a-d) < 3) {
		// There is no unit with u.s < 3, so remove all
		removeDefenders()
		removeAttackers()
		return
	}
	// Now we know that we have a difference >= 3
	if (a > d) {
		removeDefenders()
		// The attacker marks are still on
		attackerFactorsToRemove = d
		updateTurnBox(`Attacker must remove ${d} factors`)
	} else {
		removeAttackers()
		// The peer-player should remove units
		// The targetMarker blocks clicks on the units. Remove it
		// and add marks on the units instead
		targetMarker.destroy()
		targetMarker = null
		for (const u of targetHex.units) unit.addMark1(u, 'red')
		defenderFactorsToRemove = a
		updateTurnBox(`Defender must remove ${a} factors`)
	}
}
function exDone() {
	attackerFactorsToRemove = 0
	defenderFactorsToRemove = 0
	unsetAttackers()
	if (targetHex)
		for (const u of targetHex.units) unit.removeMark1(u)
	updateTurnBox()
}

// ----------------------------------------------------------------------
;(async function() {
	board = setup.stage()
	board.on('click', boardOnClick)
	let mapImage = await map.mapImage(mapData)
	let crtImg = new Image()
	crtImg.src = crtData
	await new Promise(resolve => crtImg.onload = resolve)
	crt = new Konva.Group({
		draggable: true,
		x:1000,
		y:400,
	})
	crt.add(new Konva.Image({
		image: crtImg,
		scaleX: 1.2,
		scaleY: 1.2,
	}))
	
	await unit.init(units, nations, 0.75)
	map.init({
		width: 28,
		height: 23,
		mapProperties: mapProperties,
	})
	board.add(mapImage)
	for (const h of map.hexMap.values())
		if (h.prop && h.prop.includes("o")) objectives.add(h)
	//createHelpBox()
	sequence.nextStep()
	createTurnBox()
})()

