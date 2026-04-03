// SPDX-License-Identifier: CC0-1.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/waterloo1
*/

import {ui, grid, sequence, map, unit, box} from '@uablrek/hex-games'
import {units, unitInit} from './naw-units.js'
import mapData from './waterloo.png'
import crtData from './crt.png'
import mapProperties from './map-data.json'
import seqHelp from './seq-help.txt'

// ----------------------------------------------------------------------
// UI setup, including keyboard and Boxes
// Async setup is done in "Main"

const board = ui.stage()
const info = new Konva.Layer({name: "info"})
board.getStage().add(info)
sequence.parseSeqHelp(seqHelp)

let infoBox
function createInfoBox() {
	infoBox = box.info({
        x: window.innerWidth - 330,
        y: 30,
        width: 300,
        height: 600,
        destroyable: false,
    })
	info.add(infoBox)
}
function updateInfoBox(info) {
	let txt = `Turn: ${g.turn}, time: ${g.turn+12}:00\n`
	txt += `Current player: ${playerStr[g.nat]}\n`
	txt += `Phase: ${g.phase}\n`
	txt += `Elim fr/al (exited): ${g.fr.elim}/${g.al.elim} (${g.fr.exited})\n\n`
	if (info) txt += info
	box.update(infoBox, txt)
}
let theAlertBox
function createAlertBox(txt) {
	if (theAlertBox) return
	theAlertBox = box.choice({
		x: 200,
		y: 200,
		width: 300,
		height: 300,
		text: txt
	})
	info.add(theAlertBox)
}
function boxDestroyed(box) {
	if (box == theAlertBox) theAlertBox = null
}
box.destroyCallback(boxDestroyed)
let crt
async function createCrt() {
	crt = new Konva.Group()
	let crtImg = new Image()
	crtImg.src = crtData
	await new Promise(resolve => crtImg.onload = resolve)
	let img = new Konva.Image({image: crtImg})
	const crtScale = 0.8
	img.scale({x:crtScale,y:crtScale})
	crt.add(img)
	crt.position({
		x: window.innerWidth - img.width() * crtScale - 30,
		y: 680,
	})
	info.add(crt)
}
function toggleCrt() {
	if (crt.getParent())
		crt.remove()
	else
		info.add(crt)
}
let selectedUnit
function unitOnClick(e) {
	if (!isActive()) return
	const u = unit.fromImg(e.target)
	if (g.phase == "Movement") {
		if (reachableHexes) {
			// This *may* be a click to move an already selected unit.
			// Temporary over-stacking is allowed
			const h = map.getHex(u.hex)
			if (reachableHexes.has(h)) {
				moveUnit(selectedUnit, h)
				clearMoves()
				return
			}
		}
		u.img.moveToTop()
		clearMoves()
		selectedUnit = u
		showMoves()
		return
	}
	// Combat phase. Alternatives:
	// 0. Click on a unit that can't fight
	// 1. Click on target
	// 2. Click on attacker
	// 3. Combat result:
	//    AE - Defender may advance
	//    AR - Defender may advance
	//    EX - Attacker must remove units
	//    DR - Attacker may advance
	//    DE - Attacker may advance
}
function boardOnClick(e) {
	if (!isActive()) return
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	let h = map.getHex(hex)
	if (g.phase == "Movement") moveUnit(selectedUnit, h)
}

// Keyboard
ui.setKeys([
	{key:'Enter', fn:nextStep},	
	{key:'r', fn:regretMove},
	{key:'d', fn:deleteUnit},
	{key:' ', fn:rotateStack},
	{key:'c', fn:toggleCrt},
	{key:'Escape', fn:escape}
])
function nextStep(e) {
	if (theAlertBox) return
	// This is a no-op if we are not the attacking player
	if (me && me != g.nat) return
	if (cres) {
		createAlertBox(sequence.getSeqHelp(cres))
		return
	}
	if (overstackedUnits()) {
		createAlertBox(sequence.getSeqHelp("overstacked"))
		return
	}
	sequence.nextStep()
	// TODO: Msg to server
}
function rotateStack() {
	if (!isActive()) return
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	unit.rotateStack(hex)
}
function regretMove() {
	if (!isActive()) return
	if (g.phase == "Movement") unit.regretMove(selectedUnit)
	// TODO: Msg to server
}
function deleteUnit(e) {
	if (!isActive()) return
	// TODO: Restrict to units making a retreat or EX
	// TODO: Msg to server
}
function escape(e) {
	clearMoves()
}
// ----------------------------------------------------------------------
// Sequences

function updatePhase(seq) {
	g.phase = seq.currentStep.name
	const key = seq.name + '/' + seq.currentStep.name
	updateInfoBox(sequence.getSeqHelp(key))
}

// This is the top sequence
sequence.add(new sequence.Sequence({
	name: "game",
	steps: [
		{
			name: "Initial Deplyment",
			start: function(seq) {
				initialDeployment()
				updatePhase(seq)
			},
		},
		{
			name: "French Turn",
			start: function(seq) {
				g.nat = "fr"
				sequence.jump(seq, "player")
			}
		},
		{
			//name: "Check French Winner",
			start: function(seq) {
				if (g.al.elim >= 40 && g.fr.exited >= 7)
					seq.gotoStep("Declare Winner")
				else
					seq.nextStep()
			}
		},
		{
			name: "Allied Turn",
			start: function(seq) {
				g.nat = "al"
				sequence.jump(seq, "player")
			},
		},
		{
			//name: "Check Allied Winner",
			start: function(seq) {
				if (g.fr.elim >= 40 && g.al.elim < 40)
					seq.gotoStep("Declare Winner")
				else
					seq.nextStep()
			}
		},
		{
			//name: "Step Turn",
			start: function(seq) {
				g.turn++
				if (g.turn <= 10)
					seq.gotoStep("French Turn")
				else {
					g.nat = 'none'
					seq.nextStep()
				}
			}
		},
		{
			name: "Declare Winner",
			start: updatePhase
		},
	],
}), true)

sequence.add(new sequence.Sequence({
	name: "player",
	steps: [
		{
			name: "Reinforcements",
			start: function(seq) {
				if (g.turn == 3 && g.nat == "al")
					updatePhase(seq)
				else
					seq.nextStep()
			},
		},
		{
			name: "Movement",
			start: function(seq) {
				prepareMovement()
				updatePhase(seq)
			},
			end: function(seq) {
				clearMoves()
				removeMarks()
			}
		},
		{
			name: "Combat",
			start: function(seq) {
				if (!crt.getParent()) info.add(crt)
				markCombatUnits()
				updatePhase(seq)
			},
			end: function(seq) {
				removeMarks()
			}
		},
		{
			//name: "Proceed turn",
			start: sequence.back
		},
	],
}))

// ----------------------------------------------------------------------
// Game related

let g = {
	turn: 1,
	nat: "none",
	fr: {
		elim: 0,
		exited: 0,
		demoralized: false,
	},
	al: {
		elim: 0,
		demoralized: false,
	},
}
let me = ''						// 'fr', 'al' or '' (solitarie game)
// The Combat Result (cres) indicates an action, like retreat or remove
let cres = ''					// AR|EX|DR
const playerStr = {
	fr: "French",
	al: "Allied",
	none: "None"
}

function isActive() {
	if (theAlertBox) return false
	if (!me) return true		// Solitarie game
	if (g.nat == me) {
		// Ii is my turn
		if (cres == 'DR') return false
		return true
	} else {
		// It is NOT my turn
		if (cres == 'DR') return true
		return false
	}
}

// ----------------------------------------------------------------------
// Movement

function prepareMovement() {
	cres = ''
	// TODO: consider to mark all movable units
	// Mark ZOC hexes
	for (const h of map.hexMap.values()) h.zoc = 0
	for (const u of units) {
		if (!u.hex) continue
		u.ohex = null
		if (u.nat == g.nat) continue
		const h = map.getHex(u.hex)
		h.zoc = 10				// Mark the own hex
		for (const n of h.neighZoc) if (n) n.zoc++
	}
}

// mapFunctions: removeD, blocked, getMovementCost
function removeD() {
	for (const h of map.hexMap.values()) h.d = 0
}
function blocked(h, n, i) {
	// Check if the edge has a road
	if (h.edges && h.edges.charAt(i) == 'r') return false
	// Under basic rules, we may not enter forrest hexes
	if (n.prop.includes('f')) return true
	// We can't leave a forrest, except via a road
	if (h.prop.includes('f')) return true
	return false
}
// From 'h' to 'n' over edge 'i'
function getMovementCost(h, n, i, userRef) {
	// If we are in ZOC, we can't move
	if (h.zoc) return 100
	// All others 1 (the blocked function takes care of roads and forrests)
	return 1
}

// Mark possible movements for the 'selectedUnit'
let movMarkers
const movTemplate = new Konva.Circle({
	radius: 6,
	stroke: 'gray',
	fill: 'green',
})
let reachableHexes = null
function showMoves() {
	clearMoves()
	if (selectedUnit.ohex) return
	reachableHexes = grid.movementAxial(
		selectedUnit.m, grid.hexToAxial(selectedUnit.hex), selectedUnit)
	movMarkers = new Konva.Group()
	for (h of reachableHexes.values()) {
		const m = movTemplate.clone()
		m.position(grid.hexToPixel(h.hex))
		movMarkers.add(m)
	}
	board.add(movMarkers)
}
function clearMoves() {
	reachableHexes = null
	if (movMarkers) {
		movMarkers.destroy()
		movMarkers = null
	}
}
function moveUnit(u, h) {
	if (!u || !h || !reachableHexes) return
	if (u.ohex) return		// already moved
	if (!reachableHexes.has(h)) return
	clearMoves()
	unit.moveTo(u, h.hex)
}
function removeMarks() {
	for (const u of units) unit.removeMark1(u)
}
function overstackedUnits() {
	for (const h of map.hexMap.values()) {
		if (!h.units) continue
		if (h.units.size > 1) return true
	}
	return false
}

// ----------------------------------------------------------------------
// Combat

function markCombatUnits() {
	// The defending units ZOC is marked on the map. Mark any
	// attacking unit in ZOC, and defending units in attackers ZOC
	for (const u of units) {
		if (!u.hex) continue
		if (u.nat != g.nat) continue // defending unit
		const h = map.getHex(u.hex)
		if (!h.zoc) continue
		u.mustFight = true
		for (const n of h.neighZoc) {
			if (!n.units || n.units.size == 0) continue
			let du
			for (const tu of n.units.values()) du = tu // there is only one
			if (du.nat != g.nat) du.mustFight = true
		}
	}
	for (const u of units)
		if (u.mustFight) unit.addMark1(u, 'gold')
}
const ctrMatrix = [
	['AR','AR','DR','DR','EX','DE','DE','DE'],
	['AE','AR','AR','DR','DR','EX','DE','DE'],
	['AE','AE','AR','DR','DR','DR','EX','DE'],
	['AE','AE','AR','AR','DR','DR','EX','DE'],
	['AE','AE','AR','AR','DR','DR','DR','EX'],
	['AE','AE','AE','AR','AR','DR','DR','EX'],
]

// ----------------------------------------------------------------------
// Utility functions

function initialDeployment() {
	for (const u of units) {
		if (!u.ih) continue
		const hex = nawToHex(u.ih)
		unit.moveTo(u, hex, false)
		board.add(u.img)
	}
}
function hexToNaw(hex) {
	const x = String(hex.x - 3).padStart(2, '0')
	const y = String(hex.y).padStart(2, '0')
	return x + y
}
function nawToHex(id) {
	const x = parseInt(id.substring(0,2), 10) + 3
	const y = parseInt(id.substring(2), 10)
	return {x:x,y:y}
}

// ----------------------------------------------------------------------
// Main
;(async () => {
    grid.configure(71.6, 1.0, {x:12, y:26}, true)
	const mapImage = await ui.mapImage(mapData, false)
	map.init({mapProperties: mapProperties})
	unit.config({ cornerRadius: unit.side*0.09 })
	await unitInit()
	board.add(mapImage)
	// Align the board with the bottom of the map
	let boardAdjust = board.height() - mapImage.height()
	board.y(boardAdjust)
	console.log(boardAdjust)
	createInfoBox()
	await createCrt()
	board.on('click', boardOnClick)
	for (const u of units) u.img.on('click', unitOnClick)
	grid.mapFunctions(map.getAxial)
	for (const h of map.hexMap.values()) {
		// ZOC is never blocked (under basic rules), so pre-compute
		// *before* the "blocked" function is defined.
		h.neighZoc = grid.neighboursAxial(h.ax)
	}
	// *Now* define the mapFunctions!
	grid.mapFunctions(map.getAxial, blocked, getMovementCost, removeD)
	// Start the game!
	sequence.nextStep()
})()
