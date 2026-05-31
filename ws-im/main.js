// SPDX-License-Identifier: CC0-1.0.

import Konva from 'konva'
import {ui, box, sequence, grid} from '@uablrek/hex-games'
import * as map from './map.js'
import * as ship from './ship.js'
import * as scenario from './scenario.js'
import help from './help.txt'

// ----------------------------------------------------------------------
// UI
export const board = ui.stage()
export const info = new Konva.Layer({name: "info"})
board.getStage().add(info)
sequence.parseSeqHelp(help)
let selectedShip
export let sc				// Current Scenario
let ships

let infoBox
function createInfoBox() {
	infoBox = box.info({
        x: window.innerWidth - 370,
        y: 30,
        width: 350,
        height: 640,
        destroyable: false,
    })
	info.add(infoBox)
}
let helpTxt = ""
function updateInfoBox() {
	let txt = helpTxt
	if (selectedShip) {
		const s = selectedShip
		txt += `\n\nSHIP: ${s.name} (${s.pv})\n`
		txt += `${s.class}, ${s.nguns} guns\n`
		txt += `Hull: ${s.s.hull}\n`
		if (s.car)
			txt += `Guns: L ${s.s.guns.l}(${s.s.car.l}), R ${s.s.guns.r}(${s.s.car.r})\n`
		else
			txt += `Guns: L ${s.s.guns.l}, R ${s.s.guns.r}\n`
		txt += `Crew: ${s.cq}  ${s.s.crew.join('-')}, Rigging: ${s.s.rigg.join('-')}\n`
		txt += `Mov A:${s.mov.battle.A}(${s.mov.full.A}) B:${s.mov.battle.B}(${s.mov.full.B}) C:${s.mov.battle.C}(${s.mov.full.C}) D:0(0) t:${s.mov.turn}\n`
		if (g.phase == "Planning") {
			const mp = ship.mp(s)
			txt += `Movement: [${s.m}] (${mp.mp} t:${mp.t})\n`
			if (s.setSails) txt += `Set ${s.setSails} Sails`
		}
		//const hex = map.hexToId(s.hex)
		//txt += `Hex: ${hex}, direction: ${s.d}\n`
	}
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

function shipOnClick(e) {
	if (selectedShip) ship.unmark(selectedShip)
	selectedShip = ship.fromImg(e.target)
	ship.mark(selectedShip, board)
	updateInfoBox()
}

// Keyboard
ui.setKeys([
	{key:'i', fn:map.toggleHexId},
	{key:'p', fn:map.save},
	{key:'Enter', fn:sequence.nextStep},
	{key:'Escape', fn:keyEscape},
	{key:'ArrowLeft', fn:keyMovement},
	{key:'ArrowRight', fn:keyMovement},
	{key:'ArrowUp', fn:keyMovement},
	{key:'ArrowDown', fn:keyMovement},
	{key:'a', fn:keyMovement},
	{key:'d', fn:keyMovement},
	{key:'w', fn:keyMovement},
	{key:'s', fn:keyMovement},
	{key:'c', fn:keyMovement},
	{key:'Backspace', fn:keyMovement},
	{key:' ', fn:keyMovement},
	{key:'=', fn:keyMovement},
	{key:'b', fn:keySails},
	{key:'f', fn:keySails},
])

function keyEscape(e) {
	if (selectedShip) {
		ship.unmark(selectedShip)
		selectedShip = null
		updateInfoBox()
	}
}
let savedMovement = ""
function keyMovement(e) {
	if (g.phase != "Planning" || !selectedShip) return
	if (e.key == '=') {
		// Copy the movement of the selectedShip to all friendly ships.
		// If the movement can't be applied, those ships are left as-is.
		// This should simplify ships-in-line movement.
		const m = selectedShip.m
		const n = nat(selectedShip)
		for (const s of ships) {
			if (nat(s) != n) continue
			if (s.m) continue	// already have movement orders
			s.m = m
			const mp = ship.mp(s)
			if (mp.mp < 0) s.m = ""
		}
		return
	}
	const s = selectedShip
	const oldm = s.m
	switch (e.key) {
	case 'ArrowLeft':
	case 'a':
		s.m += 'L'
		break
	case 'ArrowRight':
	case 'd':
		s.m += 'R'
		break
	case 'ArrowUp':
	case 'w':
		s.m += '1'
		break
	case 'ArrowDown':
	case 's':
		s.m += 'B'
		break
	case 'c':
	case 'Backspace':
		s.m = ""
		break
	case ' ':
		s.m = savedMovement
		break
	}
	const mp = ship.mp(s)
	if (mp.mp < 0 || mp.t < 0)
		s.m = oldm
	else
		savedMovement = s.m
	updateInfoBox()
}
function keySails(e) {
	if (g.phase != "Planning" || !selectedShip) return
	selectedShip.setSails = e.key == 'f' ? "Full" : "Battle"
	updateInfoBox()
}

const collisionMarkerTemplate = new Konva.Star({
	numPoints: 9,
	innerRadius: 10,
	outerRadius: 15,
	fill: 'red',
})
let collisionMarkers = null
function addCollision(chex) {
	if (!collisionMarkers) collisionMarkers = new Konva.Group()
	const pos = grid.hexToPixel(chex)
	const marker = collisionMarkerTemplate.clone({
		position: pos,
	})
	console.log("addCollision")
	collisionMarkers.add(marker)
}
function removeCollisionMarkers() {
	if (collisionMarkers) {
		collisionMarkers.destroy()
		collisionMarkers = null
	}
}

// ----------------------------------------------------------------------
// Game related

export const g = {
	turn: 1,
	phase: "",
	wind: {},
}

let maxMov = 0
function moveAll(i) {
	if (i >= maxMov) {
		sequence.nextStep()
		return
	}
	ship.moveAll(i)
	setTimeout(moveAll, 600, i+1)
}

function nat(s) {
	if (!sc.players) return s.nat
	// We have alliances
	for (const [key, value] of Object.entries(sc.players)) {
		if (value.includes(s.nat)) return key
	}
	return s.nat				// (fallback. should not happen)
}

// ----------------------------------------------------------------------
// Sequences

export function updatePhase(seq) {
	g.phase = seq.currentStep.name
	helpTxt = sequence.getSeqHelp(g.phase)
	if (selectedShip) {
		ship.unmark(selectedShip)
		selectedShip = null
	}
	updateInfoBox()
}

// This is the top sequence
sequence.add(new sequence.Sequence({
	name: "game",
	steps: [
		{
			name: "Welcome",
			start: function(seq) {
				g.phase = seq.currentStep.name
				helpTxt = sequence.getSeqHelp(g.phase)
				let txt = sequence.getSeqHelp("Welcome0")
				txt += `\n\nSenario:\n${sc.name}\n`
				if (sc.description) txt += `${sc.description}\n`
				txt += '\n'
				txt += helpTxt
				txt += '\n\n'
				txt += sequence.getSeqHelp("zoom")
				box.update(infoBox, txt, g.phase)
			}
		},
		{
			name: "Unfouling",
			start: sequence.proceed,
		},
		{
			name: "Planning",
			start: function(seq) {
				savedMovement = ""
				removeCollisionMarkers()
				for (const s of ships) {
					s.m = ""
					s.setSails = ""
				}
				updatePhase(seq)
			},
		},
		{
			//name: "Collision check",
			start: function(seq) {
				for (let i = 0; i < 7; i++) {
					let chex = ship.collisionCheck(i)
					while (chex) {
						addCollision(chex)
						chex = ship.collisionCheck(i)
					}
				}
				seq.nextStep()
			}
		},
		{
			name: "Movement",
			start: function(seq) {
				updatePhase(seq)
				maxMov = 0
				for (const s of ships) {
					const l = s.m.length
					if (l > maxMov) maxMov = l
				}
				moveAll(0)
			},
			end: function(seq) {
				if (collisionMarkers) board.add(collisionMarkers)
			}
		},
		{
			name: "Grappling/Ungrappling",
			start: sequence.proceed,
		},
		{
			name: "Boarding Preparation",
			start: sequence.proceed,
		},
		{
			name: "Combat",
			start: function(seq) {
				updatePhase(seq)
			},
		},
		{
			name: "Melee",
			start: sequence.proceed,
		},
		{
			name: "Reload",
			start: sequence.proceed,
		},
		{
			name: "Full Sails",
			start: function(seq) {
				for (const s of ships) {
					if (s.setSails) ship.fullSails(s, s.setSails == "Full")
				}
				seq.nextStep()
			},
		},
		{
			name: "Transfer",
			start: sequence.proceed,
		},
		{
			start: function(seq) {
				seq.gotoStep("Unfouling")
			}
		},
	],
}), true)


// ----------------------------------------------------------------------
// Main

;(async () => {
	// Load scenario (do this early)
	let scName = "trafalgar"
	const href = new URL(location.href)
	const param = href.searchParams.get("sc")
	if (param) scName = param
	scenario.init()
	sc = scenario.get(scName)
	if (!sc) {
		alert(`Scenario not found: ${scName}`)
		return
	}
	g.wind = sc.wind
	g.wind.d--					// internal representation 0-5
	// Boxes 
	createInfoBox()
	updateInfoBox()
	// Map
	await map.init(sc.map)
	map.updateWindIndicator()
	// Add ships
	ships = sc.ships
	await ship.init(ships)
	for (const s of ships) {
		ship.place(s, s.ih)
		s.img.on('click', shipOnClick)
	}
	// Start game
	sequence.nextStep()
})()
