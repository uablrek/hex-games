// SPDX-License-Identifier: CC0-1.0.
/*
  This is the game module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr

  In here are the sequences, which are the game engine. The sequences
  are made up by "phases"
*/

import Konva from 'konva'
import * as unit from './rdtr-unit.js'
import * as map from './rdtr-map.js'
import * as images from './rdtr-images.js'
import * as ui from './rdtr-ui.js'
import {box, sequence} from 'hex-games'
import {board} from './rdtr-ui.js'
import {href} from './rdtr-game.js'

// Globals
const version = 5				// The version of scenario/save files
export var g = {}				// Game status. This is loaded/saved
const playerStr = {
	nu: "Neutrals",
	it: "Italy",
	fr: "France",
	uk: "Britain",
	su: "U.S.S.R",
	ge: "Germany",
	us: "United States",
	al: "Allies",
	ax: "Axis",
	po: "Poland",
}
let me							// My alliance in a multi-player game al/ax

// ----------------------------------------------------------------------
// Sequences

function updatePhase(seq, info) {
	g.seq = seq
	g.phase = seq.currentStep.name
	ui.updateInfo(g, info)
}
// This is called from the UI on 'Enter'
export function nextStep() {
	if (me) {
		// Multiplayer
		if (me != alliance(g.nat)) return // ignore non-active player
		sendNextStep()
	}
	sequence.nextStep()
}
// This is the "top" sequence
sequence.add(new sequence.Sequence({
	name: "game",
	steps: [
		{
			name: "Connect to server",
			start: function(seq) {
				ui.setChoiceCallback((c, seq)=> {
					if (c != "Connect")
						seq.nextStep()
					else
						sequence.jump(seq, "connect")
					return false // destroy the choice box
				}, seq)
				updatePhase(seq)
				const c = box.choice({
					label: "Connect to server",
					width: 400,
					choices: ["Connect", "Local"],
				})
				c.position(ui.adjustBoxPos({x:600,y:200}))
				board.add(c)
			}
		},
		{
			//name: "Init",
			start: function(seq) {
				if (!me && g.deployment) {
					// Forced or helpful deployment
					for (const uh of g.deployment.units)
						unit.place(uh, board, true)
					g.deployment = null
				}
				seq.nextStep()
			}
		},
		{
			//name: "Initial Deployment",
			start: (seq) => {
				sequence.jump(seq, "ideploy")
			}
		},
		{
			//name: "Add Allowable",
			start: (seq) => {
				// Initial Deployment is done, mark initial Allowable
				// Builds
				addAllowables(g.allowableBuilds[0].units)
				seq.nextStep()
			}
		},
		{
			name: "Turn",
			start: (seq) => {
				sequence.jump(seq, "turn")
			}
		},
		{
			//name: "Next Turn",
			start: (seq) => {
				stepTurn()
				if (g.turn.year == 1940 && g.turn.season == 'summer')
					seq.nextStep()
				else
					seq.gotoStep("Turn")
			}
		},
		{
			name: "Decide Winner",
			start: (seq) => {
				g.player = ''
				g.front = ''
				g.action = ''
				updatePhase(seq)
			}
		},
	],
}), true)


sequence.add(new sequence.Sequence({
	name: "turn",
	steps: [
		{
			//name: "Check for YSS",
			start: (seq) => {
				if (g.turn.season == "spring") {
					sequence.jump(seq, "yss")
					return
				}
				seq.nextStep()
			}
		},
		{
			name: "Determine order of play",
			start: (seq) => {
				g.playerOrder = []
				g.i = 0
				seq.nextStep()
			}
		},
		{
			name: "Declaration of War (DoW)",
			start: (seq) => {
				g.player = "All"
				g.action = ''
				updatePhase(seq)
			}
		},
		{
			name: "Announce front action",
			start: (seq) => {
				updatePhase(seq)
				frontAction()
			}
		},
		{
			name: "Player",
			start: (seq) => {
				g.player = playerOrder[g.i]
				switch (g.player) {
				case "Axis": g.action = "Offensive"; break
				case "Allies": g.action = "Attrition"; break
				case "Soviet": g.action = "Pass"; break
				}
				seq.nextStep()
			}
		},
		{
			name: "Movement",
			start: updatePhase
		},
		{
			name: "Action",
			start: (seq) => {
				switch (s.action) {
				case "Offensive":
					sequence.jump(seq, "offensive")
					break
				case "Attrition":
					sequence.jump(seq, "attrition")
					break
				case "Pass":
					seq.nextStep()
				}
			}
		},
		{
			name: "Unit Construction",
			start: updatePhase
		},
		{
			name: "Strategic Redeployment (SR)",
			start: updatePhase
		},
		{
			name: "Remove units",
			start: updatePhase
		},
		{
			name: "Next Player",
			start: (seq) => {
				g.i++
				if (g.i >= playerOrder.length) {
					// Clean-up
					g.nat = ''
					g.player = ''
					g.front = ''
					g.action = null
					sequence.back(seq, true)
					return
				}
				seq.gotoStep("Player")
			}
		},
	],
}))

sequence.add(new sequence.Sequence({
	name: "ideploy",
	steps: [
		{
			start: (seq) => {
				seq.i = 0
				seq.nextStep()
			}
		},
		{
			name: "Initial Deployment",
			start: (seq) => {
				g.nat = g.orderOfDeployment[seq.i]
				g.player = playerStr[g.nat]
				updatePhase(seq)
				if (!me || me == alliance(g.nat)) {
					// For "po" we must bring up the "neutrals" box
					let nat = g.nat == "po" ? "nu" : g.nat
					seq.unitbox = unit.mkUnitbox(nat)
				}
			},
			end: (seq) => {
				if (seq.unitbox) {
					seq.unitbox.destroy()
					seq.unitbox = null
					if (me) sendDeployment()
				}
			}
		},
		{
			name: "Next Deployer",
			start: (seq) => {
				seq.i++
				if (seq.i >= g.orderOfDeployment.length)
					sequence.back(seq)
				else
					seq.gotoStep("Initial Deployment")
			}
		},
	]
}))

sequence.add(new sequence.Sequence({
	name: "yss",
	steps: [
		{
			name: "Year Start Sequence (YSS)",
			start: (seq) => {
				s.player = ''
				updatePhase(seq)
			}
		},
		{
			name: "SW resolution",
			start: updatePhase
		},
		{
			name: "BRP calculation",
			start: updatePhase
		},
		{
			name: "SW construction",
			start: updatePhase
		},
		{
			name: "Continue turn",
			start: sequence.back
		},
	]
}))

sequence.add(new sequence.Sequence({
	name: "offensive",
	steps: [
		{
			name: "Setup",
			start: sequence.proceed
		},
		{
			name: "Attacker naval+air",
			start: updatePhase
		},
		{
			name: "Defender inteception+DAS",
			start: updatePhase
		},
		{
			name: "Sea Transport Missions",
			start: updatePhase
		},
		{
			name: "Airborne drops",
			start: updatePhase
		},
		{
			name: "Combat",
			start: updatePhase
		},
		{
			name: "Exploitation",
			start: updatePhase
		},
		{
			name: "Continue turn",
			start: sequence.back
		},
	]
}))

sequence.add(new sequence.Sequence({
	name: "attrition",
	steps: [
		{
			name: "Attrition resolution",
			start: updatePhase
		},
		{
			name: "Continue turn",
			start: sequence.back
		},		
	]
}))

sequence.add(new sequence.Sequence({
	name: "connect",
	steps: [
		{
			name: "Connecting...",
			start: function(seq) {
				let url = 'ws://localhost:8081/ws'
				if (href.protocol != "file:")
					url = `ws://${href.host}/ws`
				console.log(`Connecting to ${url} ...`)
				openConnection(url)
				updatePhase(seq)
			}
		},
		{
			//name: "Continue turn",
			start: sequence.back
		},		
	]
}))

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
		//console.log(`Status: ${msg.status}`)
		return
	}
	if (msg.player == 'A')
		me = "ax"
	else
		me = "al"
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
			const u = unit.units[uh.i]
			if (u.hex && hexEq(u.hex, uh.hex)) continue
			unit.place(uh, board)
		}
		break
	}
}
function brokenConnection() {
	me = null
	ws = null
	alert("The connection was broken. Please reload the page")
}
function sendNextStep() {
	if (ws) ws.send('{"type":"nextstep"}')
}
function sendDeployment() {
	const msg = {type: "deployment", units: []}
	for (const [i, u] of unit.units.entries())
		if (u.hex) msg.units.push({i:i, hex:u.hex})
	sendMsg(msg)
}		
function sendMsg(msg) {
	if (ws) ws.send(JSON.stringify(msg))
}

// ----------------------------------------------------------------------
// Utils

function hexEq(h1, h2) {
	return (h1.x == h2.x && h1.y == h2.y)
}
function alliance(nat) {
	if (g.al.active.includes(nat)) return "al"
	if (g.al.neutral.includes(nat)) return "al"
	return "ax"
}

function stepTurn() {
	switch (g.turn.season) {
	case "spring":
		g.turn.season = "summer"
		break
	case "summer":
		g.turn.season = "fall"
		break
	case "fall":
		g.turn.season = "winter"
		break
	case "winter":
		g.turn.season = "spring"
		g.turn.year = g.turn.year + 1
		break
	}
	// When the turn is stepped, we must check is new allowableBuilds
	// become available. If so, we add them to allowableBuilds[0].
	// (the "consumed" entry is kept since it does no harm)
	for (let i = 1; i < g.allowableBuilds.length; i++) {
		if (turnEq(g.turn, g.allowableBuilds[i].turn)) {
			addAllowables(g.allowableBuilds[i].units)
			return true			// new allowable builds
		}
	}
	return false				// NO new allowable builds
}
function turnEq(t1, t2) {
	if (t1.year != t2.year) return false
	if (t1.season != t2.season) return false
	return true
}
function addAllowables(allowable) {
	unit.unselectAll()
	let filterOut = function(u) {
		if (u.allowable || u.selected) return true
		return false
	}
	for (const uh of allowable) {
		for (let i = 0; i < uh.cnt; i++) {
			const u = unit.fromStr(uh.type, filterOut)
			if (!u)
				console.log(`Unit not found ${d.type}`)
			else
				u.allowable = true
		}
	}
}


// The player with most BRP is first
let lastTurnFirstPlayer
function firstPlayer() {
	if (g.scenario.includes("1939") || g.scenario.includes("Campaign")) {
		if (turnEq(g.turn, { "year": 1939, "season": "fall"})) {
			lastTurnFirstPlayer = "ax"
			return lastTurnFirstPlayer
		}
	}
	// TODO: add 1942 and 1944 starts here
	// Germany and Italy are always summed together, even when Italy
	// is neutral. and if conquered, brp would be 0
	let axisBrp = g.status.ge.brp + g.status.it.brp
	// It's safe to start with UK and France. If conquered, brp would be 0
	let alliesBrp = g.nat.ge.uk + g.nat.ge.fr
	if (g.al.active.includes("su")) alliesBrp += g.status.su.brp
	if (g.al.active.includes("us")) alliesBrp += g.status.us.brp
	if (axisBrp == axisBrp) return lastTurnFirstPlayer
	if (axisBrp > axisBrp)
		lastTurnFirstPlayer = "axis"
	else
		lastTurnFirstPlayer = "allies"
	return lastTurnFirstPlayer
}

// Define g.action for all active nations and alliances
let actionBox
function frontAction() {
	g.action = {}
	let def, a, txt, player = playerStr[g.nat]
	actionBox = box.choice({
		label: "Front Action",
		width: 600,
		text: "West: Attrition, Med: Attrition, East: Attrition ", // (template)
		height: 120,
		choices: ["Offensive", "Attrition", "Pass", "Accept"]
	})
	// Allies
	a = {
		west: "Attrition",
		med: "Pass",
		east: "Pass"
	}
	for (let front of ["west", "med", "east"]) {
		txt = `West: ${a.west}, Med: ${a.med}, East: ${a.east}\n`
		txt += `Player ${player}, Front ${front}`
	}
	g.action['al'] = a
	// Before DoW Italy, US and Soviet are handled as
	// separete countries. After DoW, alliances are
	// handled; "Allies" and "Axis"
	box.update(actionBox, txt)
	actionBox.position(ui.adjustBoxPos({x:600,y:100}))
	board.add(actionBox)
}


// ----------------------------------------------------------------------
// Save & Restore related

/*
  Save data is in JSON, and MUST have a "version" element with a
  number (no semantic versioning, just an int).

  This describes version: 2 + updates

  The "type" element can be scenario|save

  A "scenario" type shows an empty map and an initialDeployment
  UnitBox.

  Once the Initial Deployment is done you can (and should) save.

  The current "allowableBuilds" MUST be the first,
  i.e. g.allowableBuilds[0].

  A type "save" has no "initialDeployment", but they have a
  "deployment" with all units on the map. The current
  "allowableBuilds" contains individual units (cnt=1) with labels
  (lbl) where they exist.

  The future "allowableBuilds" (with a "turn" element) are kept as-is
  from the "scenario" save. When the turn matches, they are added to
  the current "allowableBuilds".

  V3: A scenario *may* have a deployment element
  V4: A 'nat' element added
 */

export function loadScenario(gameObject, campaign) {
	g = gameObject
	if (g.type != "scenario") {
		alert(`Not a scenario, but ${g.type}`)
		return
	}
	if (g.version != 5) {
		alert(`Unsupported version ${g.version}`)
		return
	}
	// Mark all unit in initial deployment as "allowable"
	unit.unselectAll()
	for (const d of g.initialDeployment) {
		for (let i = 0; i < d.cnt; i++) {
			// Filter out already selected
			let u = unit.fromStr(d.type, (u)=>u.selected)
			if (!u) {
				console.log(`NO UNIT FOR ${d.type}`)
				break
			}
			u.allowable = true
		}
	}
	for (const u of unit.units)
		if (u.nat == "nu" || u.type == "ab") u.allowable = true
	delete g.initialDeployment // not included in sub-sequent saves
}
export function loadSave() {
	game = JSON.parse(rdtrSaveData)
	if (g.version != 5) {
		alert(`Unsupported version ${g.version}`)
		return
	}
	turn = g.turn
	// TODO: Rewrite!!!
}

// Initiate a download
export function download(blob, name) {
	const fileURL = URL.createObjectURL(blob);
	const downloadLink = document.createElement('a');
	downloadLink.href = fileURL;
	downloadLink.download = name;
	document.body.appendChild(downloadLink);
	downloadLink.click();
	URL.revokeObjectURL(fileURL);
}

export function saveGame() {
	if (!game) {
		game = {
			version: version,
			allowableBuilds: [null],
		}
	}
	g.type = "save"
	g.turn = turn
	g.deployment = getDeplyment()
	// Replace the current "allowableBuilds"
	let abuilds = {units: []}
	for (let u of unit.units) {
		if (!u.allowable) continue
		abuilds.units.push({cnt:1, type:unit.toStr(u), i:u.i})
	}
	g.allowableBuilds[0] = abuilds
	const json = JSON.stringify(game)
	const js = `const rdtrSaveData = '${json}'`
	const blob = new Blob([js], { type: 'text/javascript' });
	download(blob, "rdtrSaveData.js")
}
// Save the deployment as JSON
export function saveJSON() {
	const json = JSON.stringify(getDeplyment())
	const blob = new Blob([json], { type: 'application/json' })
	download(blob, "rdtr-deployment.json")
}

// Returns an array of all units on the map
function getDeplyment() {
	let dep = { units: [] }
	for (const u of unit.units) {
		if (!u.hex) continue
		dep.units.push({ u: unit.toStr(u), hex: u.hex, i:u.i })
	}
	return dep
}

