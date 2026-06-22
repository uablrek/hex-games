// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import {ui, grid, sequence, map, unit, box} from '@uablrek/hex-games'
import {units, unitInit} from './naw-units.js'
import * as client from './naw-client.js'
import * as ai from './naw-ai.js'
import mapData from './waterloo.png'
import crtData from './crt.png'
import mapProperties from './map-data.json'
import seqHelp from './seq-help.txt'

// ----------------------------------------------------------------------
// UI setup, including keyboard and Boxes
// Async setup is done in "main"

const board = ui.stage()
const info = new Konva.Layer({name: "info"})
board.getStage().add(info)
sequence.parseSeqHelp(seqHelp)
const release = {version:"4.2.0", date:"2026-06-22"}

let infoBox
function createInfoBox() {
	infoBox = box.info({
        x: window.innerWidth - 430,
        y: 30,
        width: 400,
        height: 800,
        destroyable: false,
    })
	info.add(infoBox)
}
function updateInfoBox(info) {
	let txt = `Turn: ${g.turn}, time: ${g.turn+12}:00\n`
	if (client.mode == "ai" || client.mode == "pvp") {
		txt += `Mode: ${client.mode}. You are ${playerStr[client.nat]}\n`
	} else
		txt += "Mode: Solitarie game\n"
	txt += `Current player: ${playerStr[g.nat]}\n`
	txt += `Phase: ${g.phase}\n`
	txt += `Elim al/fr (exited): ${g.al.elim}/${g.fr.elim} (${g.fr.exited})\n`
	if (g.fr.demoralized) txt += "Demoralized: France\n"
	if (g.al.demoralized) txt += "Demoralized: Allies\n"
	if (remainingEX) txt += `CF to remove: ${remainingEX}\n`
	if (g.testMode) txt += "TEST MODE ENABLED!\n"
	txt += '\n'
	txt += sequence.getSeqHelp(g.phase)
	if (info) txt += info
	box.update(infoBox, txt, g.phase)
}
let theAlertBox
function createAlertBox(txt) {
	if (theAlertBox) return
	theAlertBox = box.choice({
		x: 200,
		y: 200,
		width: 300,
		height: 200,
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
		x: 30,
		y: 30,
	})
	info.add(crt)
}
let selectedUnit
function unitOnClick(e) {
	if (client.waiting || !isActive()) return
	const u = unit.fromImg(e.target)
	switch (g.phase) {
	case "Movement":
		movementUnitClick(u)
		break
	case "Combat Assignment":
		// 0. Click on a unit that can't fight
		// 1. Click on target
		// 2. Click on attacker
		if (nat(u) != g.nat) {
			addDefender(u)
		} else
			addAttacker(u)		// ignored if the unit can't attack
		break
	case "Combat Resolution":
		// 0. Click on a unit that can't fight
		// 1. Click on a unit in a combat-group
		removeTargetMarkers()
		cg = findCombatGroup(u)
		if (cg) {
			// Place target-markers on defenders
			for (const u of cg.defenders.values()) setTargetMarker(u)
			computeOdds(cg)
		} else {
			oddsMarker.remove()
		}
		break
	case "Retreat":
		// 0. Click on a unit that is not retreating
		// 1. Click on a retreating unit
		// 2. Click on a displaced unit
		prepareRetreat(u)
		break
	case "Advance":
		// 0. Click on a unit that is not advancing
		// 1. Click on an advancing unit
		if (advancingUnits.has(u)) markSelected(u)
	case "Remove Attackers":
		if (cg.attackers.has(u) && !u.bombarding) markSelected(u)
		break
	}
}
function boardOnClick(e) {
	if (!isActive()) return
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	let h = map.getHex(hex)
	switch (g.phase) {
	case "Movement":
		// 0. Click on an un-marked hex
		// 1. Click on hex marked for movement
		moveSelectedUnit(h)
		break
	case "Retreat":
		// 0. Click on an un-marked hex
		// 1. Click on hex marked for retreat
		moveSelectedUnit(h)
		unit.removeMark1(selectedUnit)
		break
	case "Advance":
		// 0. Click on a non-vacated hex
		// 1. Click on hex vacated after combat
		if (reachableHexes.has(h)) advanceSelected(h)
		break
	}
}
const selectMarker = new Konva.Rect({
	height: unit.side + 2,
	width: unit.side + 2,
	offset: {x:unit.side/2 + 1, y:unit.side/2 + 1},
	stroke: 'green',
	strokeWidth: 2,
})
function markSelected(u) {
	selectedUnit = u
	const pos = grid.hexToPixel(selectedUnit.hex)
	selectMarker.position(pos)
	if (!selectMarker.getParent()) board.add(selectMarker)
}
function unmarkSelected() {
	selectedUnit = null
	selectMarker.remove()
}
// Keyboard
ui.setKeys([
	{key:'Enter', fn:nextStep},	
	{key:'r', fn:regretMove},
	{key:'d', fn:deleteUnit},
	{key:' ', fn:rotateStack},
	{key:'Escape', fn:escape},
	{key:'t', fn:setTestMode},
	{key:'l', fn:function(e) {
		if (g.phase == "Combat Resolution") {
			reduceOdds++
			computeOdds(cg)
		}
	}},
	{key:'1', fn:rollDie},
	{key:'2', fn:rollDie},
	{key:'3', fn:rollDie},
	{key:'4', fn:rollDie},
	{key:'5', fn:rollDie},
	{key:'6', fn:rollDie},
])
function nextStep(e) {
	if (theAlertBox) return
	if (client.mode == "ai" && g.nat == "none") {
		// Allow start-game in ai-mode
		sequence.nextStep()
		return
	}
	if (client.mode == "pvp" && g.nat == "none" && client.side == 'A') {
		// Allow side A to start-game in pvp-mode
		sequence.nextStep()
		return
	}
	// This is a no-op if we are not the attacking player
	if (me && me != g.nat) return
	switch (g.phase) {
	case "Movement":
		if (overstackedUnits()) {
			createAlertBox(sequence.getSeqHelp("overstacked"))
			return
		}
		break
	case "Combat Assignment":
		if (!combatRulesOK()) {
			createAlertBox(sequence.getSeqHelp("combatrules"))
			return
		}
		break
	case "Combat Resolution":
		if (cres) {
			// We are in an un-finished combat resolution
			createAlertBox(sequence.getSeqHelp(cres))
			return
		}
		break
	case "Remove Attackers":
		/*
		  Special case: if only bombarding attackers remain, the EX
		  result is considered to be fulfilled
		*/
		let onlyBombarding = true
		for (const u of cg.attackers)
			if (u.hex && !u.bombarding) onlyBombarding = false
		if (remainingEX != 0 && !onlyBombarding) {
			createAlertBox(sequence.getSeqHelp("remainingEX"))
			return
		}
	}
	sequence.nextStep()
	// TODO: Msg to server
}
function rollDie(e) {
	if (g.phase == "Roll the Die") {
		dieRoll = Number(e.key)
		sequence.nextStep()
	}
}
function rotateStack() {
	if (!isActive()) return
	let pos = board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	unit.rotateStack(hex)
}
function regretMove() {
	if (!isActive()) return
	if (g.phase == "Movement") {
		unit.regretMove(selectedUnit)
		unmarkSelected()
	}
	// TODO: Msg to server
}
function deleteUnit(e) {
	if (!isActive()) return
	switch (g.phase) {
	case "Movement":
		if (selectedUnit && g.testMode) {
			clearMoves()
			removeUnit(selectedUnit)
			unmarkSelected()
		}
		break
	case "Retreat":
		// This is NOT allowed (likely)
		if (selectedUnit && cg.defenders.has(selectedUnit)) {
			removeUnit(selectedUnit)
			unmarkSelected()
		}
		break
	case "Remove Attackers":
		if (selectedUnit && advancingUnits.has(selectedUnit)) {
			remainingEX -= selectedUnit.s
			if (remainingEX < 0) remainingEX = 0
			removeUnit(selectedUnit)
			advancingUnits.delete(selectedUnit)
			unmarkSelected()
		}
		break
	}
	// TODO: Msg to server
}
function escape(e) {
	switch (g.phase) {
	case "Movement":
		clearMoves()
		unmarkSelected()
		break
	case "Combat Assignment":
		prepareCombatAssignment()
		break
	case "Combat Resolution":
		reduceOdds = 0
		computeOdds(cg)
		break
	}
}
function setTestMode() {
	if (me) return				// not a solitarie game
	if (g.phase == "Initial Deployment") {
		g.testMode = true
		sequence.nextStep()
	}
}
// ----------------------------------------------------------------------
// Sequences

export function updatePhase(seq, info) {
	g.phase = seq.currentStep.name
	updateInfoBox(info)
}
function checkWinner(seq) {
	if (g.winner)
		seq.gotoStep("Declare Winner")
	else
		seq.nextStep()
}
// This is the top sequence
sequence.add(new sequence.Sequence({
	name: "game",
	steps: [
		{
			start: function(seq) {
				sequence.jump(seq, "server-connect")
			},
			end: function(seq) {
				if (client.mode == "ai") ai.init()
				me = client.nat
			}
		},
		{
			name: "Initial Deployment",
			start: function(seq) {
				initialDeployment()
				const ver = `\n\nVersion ${release.version}, ${release.date}`
				if (client.mode == "sol" && client.side != 'A') {
					// Allow test mode in stand-alone solitarie games
					updatePhase(
						seq, '\n' + sequence.getSeqHelp("test-mode") + ver)
				} else
					updatePhase(seq, ver)
			},
		},
		{
			name: "French Turn",
			start: function(seq) {
				g.nat = "fr"
				g.onat = "al"
				if (client.mode == "ai" && me == "al")
					sequence.jump(seq, "ai-player")
				else
					sequence.jump(seq, "player")
			}
		},
		{
			start: checkWinner
		},
		{
			name: "Allied Turn",
			start: function(seq) {
				g.nat = "al"
				g.onat = "fr"
				if (client.mode == "ai" && me == "fr")
					sequence.jump(seq, "ai-player")
				else
					sequence.jump(seq, "player")
			},
		},
		{
			start: checkWinner
		},
		{
			//name: "Step Turn",
			start: function(seq) {
				g.turn++
				if (g.turn <= 10)
					seq.gotoStep("French Turn")
				else
					seq.nextStep()
			}
		},
		{
			name: "Declare Winner",
			start: function(seq) {
				g.nat = "none"
				const key = "winner-" + g.winner
				updatePhase(seq, sequence.getSeqHelp(key))
			}
		},
	],
}), true)

sequence.add(new sequence.Sequence({
	name: "player",
	steps: [
		{
			name: "Reinforcements",
			start: function(seq) {
				if (g.turn < 3 || g.nat != "al" || undeployed.size == 0) {
					seq.nextStep()
					return
				}
				board.add(unitBox.box)
				updatePhase(seq)
			},
			end: function(seq) {
				unitBox.box.remove()
				checkReinforcements()
			}
		},
		{
			name: "Movement",
			start: function(seq) {
				computeZOC()
				if (g.testMode) {
					setDraggable(true)
					updatePhase(seq, "\nd - Delete selected unit")
				} else
					updatePhase(seq)
			},
			end: function(seq) {
				removeExitedUnits()
				computeZOC() // re-compute after movement
				for (const u of units) u.consumedMF = 0
				unmarkSelected()
				if (g.testMode) setDraggable(false)
			}
		},
		{
			// Exited French units may give a French victory
			start: function(seq) {
				if (g.winner)
					sequence.back(seq)
				else
					seq.nextStep()
			}
		},
		{
			name: "Combat Assignment",
			start: function(seq) {
				prepareCombatAssignment()
				updatePhase(seq)
			},
			end: function(seq) {
				removeTargetMarkers()
			}
		},
		{
			//name: "Jump to Combat Resolution",
			start: function(seq) {
				sequence.jump(seq, "combat-resolution")
			},
		},
		{
			//name: "Proceed turn",
			start: sequence.back
		},
	],
}))

sequence.add(new sequence.Sequence({
	name: "combat-resolution",
	steps: [
		{
			name: "check-combat-groups",
			start: function(seq) {
				if (!combatGroups) {
					sequence.back(seq)
					return
				}
				for (const c of combatGroups) {
					if (!c.used) {
						seq.nextStep()
						return
					}
				}
				sequence.back(seq)
			},
		},
		{
			name: "Combat Resolution",
			start: function(seq) {
				reduceOdds = 0
				cg = null
				cres = ''
				oddsMarker.remove()
				updatePhase(seq)
			},
		},
		{
			name: "Roll the Die",
			start: function(seq) {
				if (!cg) {
					// The user has not selected a combatGroup
					createAlertBox("No target selected")
					seq.gotoStep("Combat Resolution")
					return
				}
				if (g.testMode) {
					updatePhase(seq)
				} else {
					dieRoll = Math.floor(Math.random() * 6) + 1
					seq.nextStep()
				}
			},
			end: function(seq) {
				removeTargetMarkers()
			}
		},
		{
			//name: "cres",
			start: function(seq) {
				attack()
				if (retreatingUnits)
					sequence.jump(seq, "retreat")
				else if (cres == "EX")
					sequence.jump(seq, "EX")
				else
					seq.nextStep()
			}
		},
		{
			name: "Advance",
			start: function(seq) {
				// An EX/retreat might result in a winner
				if (g.winner) {
					sequence.back(seq)
					return
				}				
				if (advancingUnits.size == 0) {
					// This may happen as cause of an EX result
					computeZOC()
					seq.nextStep()
					return
				}
				let onlyBombarding = true
				for (const u of advancingUnits) {
					if (u.bombarding)
						unit.removeMark1(u)
					else {
						unit.addMark1(u, 'yellow')
						onlyBombarding = false
					}
				}
				// Handle the special case where we have only bombarding units
				if (onlyBombarding)
					seq.nextStep()
				else {
					showMoves({}, vacatedHexes)
					updatePhase(seq)
				}
			},
			end: function(seq) {
				// Un-mark the current combat-group
				for (const u of cg.defenders) unit.removeMark1(u)
				for (const u of cg.attackers) unit.removeMark1(u)
				computeZOC()
				cg = null
				clearMoves()
				oddsMarker.remove()
			}
		},
		{
			//name: "next cg",
			start: function(seq) {
				seq.gotoStep("check-combat-groups")
			}
		},
	],
}))
sequence.add(new sequence.Sequence({
	name: "retreat",
	steps: [
		{
			name: "Retreat",
			start: function(seq) {
				for (const u of retreatingUnits) {
					if (!u.bombarding) unit.addMark1(u, 'yellow')
				}
				updatePhase(seq)
			},
			end: function(seq) {
				// (moveUnit() doesn't clear selectedUnit)
				selectedUnit = null
			},
		},
		{
			//name: "remove non-retreated"
			// NOTE: This is against the rules (probably). Please see:
			// https://boardgamegeek.com/thread/3704152/voluntarily-eliminate-units-instead-of-retreating
			start: function(seq) {
				for (const u of retreatingUnits) {
					// Bombarding artillery doesn't have to retreat
					if (!u.ohex && !u.bombarding) removeUnit(u)
				}
				seq.nextStep()
			},
			end: function(seq) {
				unmarkSelected()
			}
		},
		{
			//name: "return",
			start: sequence.back
		}
	],
}))
sequence.add(new sequence.Sequence({
	name: "EX",
	steps: [
		{
			name: "Remove Attackers",
			start: function(seq) {
				updatePhase(seq, `\n\nRemaining CF: ${remainingEX}`)
			},
		},
		{
			//name: "return",
			start: sequence.back
		}
	],
}))

// ----------------------------------------------------------------------
// Game related
export let g = {
	turn: 1,
	nat: "none",				// Active player
	onat: "none",				// "other" player
	winner: '',
	testMode: false,
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
		// It is my turn
		if (cres == 'DR') return false
		return true
	} else {
		// It is NOT my turn
		if (cres == 'DR') return true
		return false
	}
}
function removeUnit(u) {
	g[nat(u)].elim += u.s
	unit.remove(u)
	if (!g.al.demoralized && !g.fr.demoralized) {
		// The special (rare) case, where both sides have
		// lost 40cf at the same time due to an EX result,
		// is covered since the defender is removed first.
		if (g.fr.elim >= 40) g.fr.demoralized = true
		if (g.al.elim >= 40) g.al.demoralized = true
	}
	if (g.al.demoralized && g.fr.exited >= 7)
		g.winner = "fr"
	else if (g.fr.demoralized)
		g.winner = "al"
	updateInfoBox()
}

// ----------------------------------------------------------------------
// Movement

export function computeZOC() {
	clearMoves()
	removeMarks()
	// Tag ZOC hexes
	// .zoc - Current (friendly) player ZOC
	// .ezoc - Enemy player ZOC (blocks movement)
	for (const h of map.hexMap.values()) {
		h.ezoc = 0
		h.zoc = 0
	}
	for (const u of units) {
		if (!u.hex) continue
		u.ohex = null
		const h = map.getHex(u.hex)
		if (nat(u) == g.nat) {
			h.zoc = 10
			for (const n of h.neighZoc) if (n) n.zoc++
		} else {
			h.ezoc = 10
			for (const n of h.neighZoc) if (n) n.ezoc++
		}
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
function getMovementCost(h, n, i, u) {
	if (g.phase == "Retreat") {
		// We can retreat *out* of (E)ZOC, but not *into* it.
		// Either defender or attacker may retreat, so handle both cases
		if (nat(u) == g.nat && n.ezoc) return 100
		if (nat(u) != g.nat && n.zoc) return 100
		return 1
	}
	// If we are in EZOC, we can't move
	if (h.ezoc) return 100
	// Only French can move to exit hexes
	if (n.prop.includes('b') && nat(u) != "fr") return 100
	// All others 1 (the blocked function takes care of roads and forrests)
	return 1
}

// Mark possible movements
let movMarkers
const movTemplate = new Konva.Circle({
	radius: 6,
	stroke: 'gray',
	fill: 'green',
})
let reachableHexes = null
function showMoves(u, hexes) {
	clearMoves()
	if (u.ohex) return
	if (hexes)
		// defined hexes for advance/retreat
		reachableHexes = hexes
	else
		reachableHexes = grid.movementAxial(
			u.m - u.consumedMF, grid.hexToAxial(u.hex), u)
	movMarkers = new Konva.Group()
	for (const h of reachableHexes.values()) {
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
function moveSelectedUnit(h) {
	if (!selectedUnit || !h || !reachableHexes) return
	if (selectedUnit.ohex) return		// already moved
	if (!reachableHexes.has(h)) return
	clearMoves()
	selectMarker.remove()	// (stays in the old hex and looks weird)
	unit.moveTo(selectedUnit, h.hex)
	// The moved unit is still selected, but have no mark
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
function movementUnitClick(u) {
	if (nat(u) != g.nat) return  // Ignore click on enemy units
	if (reachableHexes) {
		// This *may* be a click to move an already selected unit.
		// Temporary over-stacking is allowed
		const h = map.getHex(u.hex)
		if (reachableHexes.has(h)) {
			moveSelectedUnit(h)
			return
		}
	}
	markSelected(u)
	showMoves(u)
}
// In test-mode all units are draggable
function setDraggable(on) {
	for (const u of units) {
		if (!u.hex) continue
		if (on) {
			u.img.draggable(true)
			u.img.on('dragstart', (e)=>{e.target.moveToTop()})
			u.img.on('dragend', unitDragEnd)
		} else {
			u.img.draggable(false)
		}
	}
}
function unitDragEnd(e) {
	clearMoves()
	unmarkSelected()
	const u = unit.fromImg(e.target)
	let hex = grid.pixelToHex(e.target.position())
	unit.moveTo(u, hex, false)
	computeZOC()
}
function advanceSelected(h) {
	if (!selectedUnit) return
	// ZOC may be ignored, but normal movement rules apply
	// We can go to this hex if it's non-forrest, or if we have a road to it
	const f = map.getHex(selectedUnit.hex) // ("from" hex)
	const neig = grid.neighboursAxial(f.ax)
	for (const [i, n] of neig.entries()) {
		if (n == h) {
			if (h.prop.includes('f') && !f.edges && f.edges.charAt(i) == 'r')
				return
			moveSelectedUnit(h)
			selectedUnit = null
			sequence.nextStep()
			// TODO: send to server
			break
		}
	}
}
function removeExitedUnits() {
	for (const u of units) {
		if (!u.hex) continue
		if (!nat(u) == "fr") continue
		const h = map.getHex(u.hex)
		if (h.prop.includes('b')) {
			unit.remove(u)
			g.fr.exited++
		}
	}
	if (g.al.demoralized && g.fr.exited >= 7) g.winner = "fr"
}

/*
  RETREAT (the most complex thing in the game):

  * Units may not retreat into enemy ZOC (EZOC)
  * If the unit can retreat to an empty hex out of EZOC, it *must* do so
  * If there is no empty hex, units must be "displaced", possibly in a chain
  * If retreat is not possible (possibly down the chain) the unit is removed
*/
function prepareRetreat(u) {
	if (!retreatingUnits.has(u)) return
	markSelected(u)
	let hexes = grid.movementAxial(1, grid.hexToAxial(u.hex), u)
	if (hexes.size == 0) {
		// the unit can't retreat
		reachableHexes = hexes
		return
	}
	let emptyHexes = false
	for (const h of hexes)
		if (!h.units || h.units.size == 0) emptyHexes = true
	if (emptyHexes) {
		for (const h of hexes)
			if (h.units && h.units.size > 0) hexes.delete(h)
		showMoves(u, hexes)
	} else {
		// We have no empty hexes. Check displacement
	}
	/*
	  There is a edge-case here when an artillery that is assigned
	  for bombardement is to be displaced. Please see:
	  https://boardgamegeek.com/thread/569103/retreat-chain-question
	  If the bombardement is required to satisfy the engagement rules,
	  then it can NOT be displaced.
	  Put differently, the combat-group must have only bombardement
	  attackers AND the defender (must be just one) must be adjacent
	  to other friendly ground units.
	  TODO: implement this.
	*/
}

// ----------------------------------------------------------------------
// Combat

let combatGroups = []
let cg = null
let dieRoll = 0
let reduceOdds = 0
let vacatedHexes
let advancingUnits
let retreatingUnits
let remainingEX = 0

export function prepareCombatAssignment() {
	combatGroups = []
	cg = null
	removeTargetMarkers()
	oddsMarker.remove()
	removeMarks()
	markCombatUnits()
}
function addDefender(u) {
	// If we have a completed combatGroup, add it
	addCombatGroup()
	// If the defender is in a combatGroup, compute odds and set cg
	// This happens if the player add more attackers
	let c = findCombatGroup(u)
	if (c) {
		computeOdds(c)
		cg = c
	}
	if (cg && cg.defenders.size > 0) {
		// If defenders exist already, the new defender is added to the
		// set if they are adjacent to the same enemy unit(s)
		let a
		for (const du of cg.defenders.values()) {
			const au = adjacentUnits(du, g.nat)
			if (!a) a = au; else a = a.intersection(au)
		}
		// 'a' is now a set of attackers adjacent to *all* defenders.
		if (a.intersection(adjacentUnits(u, g.nat)).size > 0) {
			// We have at least one attacker adjacent to all defenders
			cg.defenders.add(u)
			setTargetMarker(u)
			return
		}
	}
	// new selected defender, discard old one
	cg = {attackers: new Set(), defenders: new Set()}
	cg.defenders.add(u)
	removeTargetMarkers()
	setTargetMarker(u)
}
function addCombatGroup() {
	// Omit CombatGroups with zero attackers. This may happen if a
	// defender is marked for bombardment, and the attacker changes hes mind
	if (!cg || cg.attackers.size == 0) return
	combatGroups.push(cg)
	removeTargetMarkers()
	for (const du of cg.defenders.values())
		unit.addMark1(du, 'green')
	cg = null
}
const targetMarkerTemplate = new Konva.Group()
targetMarkerTemplate.add(new Konva.Circle({
	radius: 20,
	stroke: 'white',
}))
targetMarkerTemplate.add(new Konva.Path({
	stroke: 'white',
	data: "M 0 -20 l 0 10 m 0 20 l 0 10 M -20 0 l 10 0 m 20 0 l 10 0",
}))
let targetMarkers
export function setTargetMarker(u) {
	let pos = grid.hexToPixel(u.hex)
	if (!targetMarkers) {
		targetMarkers = new Konva.Group()
		board.add(targetMarkers)
	}
	const targetMarker = targetMarkerTemplate.clone()
	targetMarker.position(pos)
	targetMarkers.add(targetMarker)
	targetMarkers.moveToTop()
}
export function removeTargetMarkers() {
	if (targetMarkers) {
		targetMarkers.destroy()
		targetMarkers = null
	}
}
function addAttacker(u) {
	// If the attacker is in a combatGroup, just compute odds
	let c = findCombatGroup(u)
	if (c) {
		computeOdds(c)
		return
	}
	if (!cg || cg.defenders.size == 0) return
	// Check that the attacker is not in a combatGroup already
	for (const c of combatGroups)
		if (c.attackers.has(u)) return
	// An attacker must be adjacent to *all* defenders, or do a bombardment
	const e = adjacentUnits(u, g.onat)
	if (cg.defenders.isSubsetOf(e) || bombardment(u)) {
		cg.attackers.add(u)
		unit.addMark1(u, 'green')
		computeOdds(cg)
	}
	for (const du of cg.defenders.values())
		unit.addMark1(du, 'green')
}
function bombardment(u) {
	if (u.type != "art") return false
	if (u.engaged) return false	// must do a normal attack
	if (cg.defenders.size > 1) {
		/*
		  This is tricky. Bombardment is allowed to a group of defenders
		  if it is supported by inf or cav. But must *all* enemy units
		  be in range, or just one? The thread below suggests the
		  later, so I go with that.
		  https://boardgamegeek.com/thread/3255614/i-have-a-question-regarding-the-an-attack-may-be-m
		*/
		let supported = false
		for (const u of cg.attackers.values()) {
			if (u.type != "art") {
				supported = true
				break
			}
		}
		if (!supported) return false
	}
	const axa = grid.hexToAxial(u.hex)
	let inRange = false
	// The artillery must be 2 hexes away from *any* defender, AND have
	// a Line of Sight (LOS)
	const axd = grid.hexToAxial(u.hex)
	for (const du of cg.defenders.values()) {
		const axd = grid.hexToAxial(du.hex)
		if (grid.axialDistance(axa, axd) == 2) {
			if (los(axa, axd)) {
				inRange = true
				u.bombarding = true
				break
			}
		}
	}
	return inRange
}
function los(ax1, ax2) {
	// LOS is blocked if a forrest hex is precisely between the two
	// hexes, or 2 forrest hexes are between the two hexes. Or, put in
	// another way, if forrest occupy all hexes in ZOC of both units
	const z1 = new Set(map.getAxial(ax1).neighZoc)
	const z2 = new Set(map.getAxial(ax2).neighZoc)
	let hasLOS = false
	for (h of z1.intersection(z2).values())
		if (!h.prop.includes('f')) hasLOS = true
	return hasLOS
}

// Return a set of adjacent units
function adjacentUnits(u, _nat='') {
	const s = new Set()
	if (!u.hex) return s
	const h = map.getHex(u.hex)
	for (const n of h.neighZoc) {
		if (!n.units || n.units.size == 0) continue
		for (const tu of n.units.values()) 
			if (!_nat || _nat == tu.nat) s.add(tu)
	}
	return s
}
const oddsMarker = new Konva.Circle({
	radius: 17,
	stroke: 'red',
	strokeWidth: 4,
})
function computeOdds(cgroup) {
	let a = 0
	for (const au of cgroup.attackers) a += au.s
	let d = 0
	for (const du of cgroup.defenders) {
		let terrainModifier = 2	// forrest, houses, stout houses
		const h = map.getHex(du.hex)
		if (h.prop.includes('c')) terrainModifier = 1
		d += (du.s * terrainModifier)
	}
	if (a == 0 || d == 0) {
		return
	}
	if (a >= d)
		crtCol = Math.floor(a/d) + 3
	else
		crtCol = 5 - Math.ceil(d/a)
	// Demoralization penalty
	if (g[g.nat].demoralized) crtCol--  // attacker demoralized
	if (g[g.onat].demoralized) crtCol++ // defender demoralized
	// It *may* be beneficial to voluntarily reduce the odds to avoid
	// an EX result, as discussed at:
	// https://boardgamegeek.com/thread/2472277/voluntarily-reduce-odds
	crtCol -= reduceOdds
	if (crtCol > 9) crtCol = 9
	if (crtCol < 0) crtCol = 0
	oddsMarker.y(32)
	oddsMarker.x(42*crtCol + 67)
	if (!oddsMarker.getParent())
		crt.add(oddsMarker)
}
const ctrMatrix = [
	['AE','AR','AR','DR','DR','EX','DE','DE','DE','DE'],
	['AE','AE','AR','AR','DR','DR','EX','DE','DE','DE'],
	['AE','AE','AE','AR','DR','DR','DR','EX','DE','DE'],
	['AE','AE','AE','AR','AR','DR','DR','EX','DE','DE'],
	['AE','AE','AE','AR','AR','DR','DR','DR','EX','DE'],
	['AE','AE','AE','AE','AR','AR','DR','DR','EX','DE'],
]
function getCres() {
	computeOdds(cg)
	cres = ctrMatrix[dieRoll-1][crtCol]
	if (crtCol == 0 || crtCol == 9)
		oddsMarker.y(32 + 77)
	else
		oddsMarker.y(32 + dieRoll*22)
}
function attack() {
	cg.used = true
	getCres()
	vacatedHexes = new Set()
	advancingUnits = null
	retreatingUnits = null
	remainingEX = 0
	switch (cres) {
	case "AE":
		advancingUnits = cg.defenders
		for (const u of cg.attackers.values()) {
			// Do not add bombarding unit's hexes
			if (!u.bombarding) vacatedHexes.add(map.getHex(u.hex))
			removeUnit(u)
		}
		break
	case "AR":
		retreatingUnits = cg.attackers
		advancingUnits = cg.defenders
		for (const u of cg.attackers.values())
			if (!u.bombarding) vacatedHexes.add(map.getHex(u.hex))
		break
	case "DR":
		retreatingUnits = cg.defenders
		advancingUnits = cg.attackers
		for (const u of cg.defenders.values())
			vacatedHexes.add(map.getHex(u.hex))
		break
	case "EX":
		advancingUnits = cg.attackers
		for (const u of cg.defenders.values()) {
			remainingEX += u.s
			vacatedHexes.add(map.getHex(u.hex))
			removeUnit(u)
		}
		break
	case "DE":
		advancingUnits = cg.attackers
		for (const u of cg.defenders.values()) {
			vacatedHexes.add(map.getHex(u.hex))
			removeUnit(u)
		}
		break
	}
}
function findCombatGroup(u) {
	if (!u) return null
	for (const c of combatGroups) {
		if (c.used) continue
		if (c.attackers.has(u) || c.defenders.has(u)) return c
	}
	return null
}
export function markCombatUnits() {
	for (const u of units) u.engaged = false
	// Engaged units are either friendly units in EZOC of enemy units
	// in friendly ZOC
	for (const u of units) {
		if (!u.hex) continue
		const h = map.getHex(u.hex)
		if (nat(u) == g.nat && h.ezoc) u.engaged = true
		if (nat(u) != g.nat && h.zoc) u.engaged = true
	}
	for (const u of units) 
		if (u.engaged) unit.addMark1(u, 'yellow')
}
function combatRulesOK() {
	addCombatGroup()
	// all units with '.engaged' must be in a combatGroup
	for (const u of units) {
		if (!u.hex || !u.engaged) continue
		if (!findCombatGroup(u)) return false
	}
	return true
}

// ----------------------------------------------------------------------
// Reinforcements

export const undeployed = new Set()
let unitBox

function createUnitBox() {
	unitBox = new unit.UnitBox({
		text: "Prussians",
		cols: 5,
		destroyable: false,
		unitTypes: [
			{type:'inf', stat: "5-4"},
			{type:'inf', stat: "4-4"},
			{type:'cav', stat: "3-5"},
			{type:'art', stat: "3-3"},
			{type:'art', stat: "4-3"},
		],
	})
	for (const u of units) {
		if (u.nat != 'pu') continue
		if (u.t != 3) continue
		undeployed.add(u)
		unitBox.addUnit(u)
	}
	unitBox.box.position({x:1000,y:200})
}
// Units illegaly placed are brought back to the UnitBox
function checkReinforcements() {
	computeZOC()
	for (const u of undeployed) {
		if (!u.hex) continue	// not placed
		const h = map.getHex(u.hex)
		if (u.hex.x != 26 || h.prop.includes('f') || h.ezoc) {
			unit.remove(u)
			unitBox.addUnit(u)
		} else {
			u.consumedMF = 1
			undeployed.delete(u)
			u.img.draggable(false)
		}
	}
}

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
export function nat(u) {
	if (u.nat == "pu") return "al"
	return u.nat
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
	// Align the board with the bottom and left edge of the map
	const boardAdjust = {x:-216, y:board.height() - mapImage.height()}
	board.position(boardAdjust)
	createInfoBox()
	createUnitBox()
	await createCrt()
	board.on('click', boardOnClick)
	for (const u of units) {
		u.img.on('click', unitOnClick)
		u.consumedMF = 0
	}
	grid.mapFunctions(map.getAxial)
	for (const h of map.hexMap.values()) {
		// ZOC is never blocked by terrain (under basic rules), so
		// pre-compute *before* the "blocked" function is defined.
		h.neighZoc = grid.neighboursAxial(h.ax)
	}
	// *Now* define the mapFunctions!
	grid.mapFunctions(map.getAxial, blocked, getMovementCost, removeD)
	// Start the game!
	sequence.nextStep()
})()
