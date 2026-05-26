// SPDX-License-Identifier: CC0-1.0.

import Konva from 'konva'
import {ui, box, sequence} from '@uablrek/hex-games'
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
        height: 600,
        destroyable: false,
    })
	info.add(infoBox)
}
let helpTxt = ""
function updateInfoBox(info) {
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
		txt += `Mov T:${s.mov.turn} A:${s.mov.battle.A}(${s.mov.full.A}) B:${s.mov.battle.B}(${s.mov.full.B}) C:${s.mov.battle.C}(${s.mov.full.C}) D:0(0)\n`
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
	{key:'s', fn:map.save},
	{key:'Enter', fn:sequence.nextStep},
	{key:'Escape', fn:keyEscape},
	{key:'ArrowLeft', fn:keyMovement},
	{key:'ArrowRight', fn:keyMovement},
	{key:'ArrowUp', fn:keyMovement},
	{key:'ArrowDown', fn:keyMovement},
	{key:' ', fn:keyMovement},
])

function keyEscape(e) {
	if (selectedShip) {
		ship.unmark(selectedShip)
		selectedShip = null
		updateInfoBox()
	}
}
let savedMovement
function keyMovement(e) {
	console.log("keyMovement", g.phase, e)
	if (g.phase != "Movement Notation" || !selectedShip) return
	const s = selectedShip
	if (s.mleft == 0) {
		// TODO: handle the special case when the ship start in
		// direction D, and get a free turn
		return
	}
	s.mleft--
	switch (e.key) {
	case 'ArrowLeft':
		s.m += 'L'
		break
	case 'ArrowRight':
		s.m += 'R'
		break
	case 'ArrowUp':
		s.m += '1'
		break
	case 'ArrowDown':
		s.m += 'B'
		break
	case ' ':
		// TODO: verify that savedMovement is allowed
		s.m = savedMovement
		break
	}
	savedMovement = s.m
	updateInfoBox()
}

// ----------------------------------------------------------------------
// Game related

export const g = {
	turn: 1,
	phase: "",
	wind: {},
}

// ----------------------------------------------------------------------
// Sequences

export function updatePhase(seq, info) {
	g.phase = seq.currentStep.name
	helpTxt = sequence.getSeqHelp(g.phase)
	if (selectedShip) {
		ship.unmark(selectedShip)
		selectedShip = null
	}
	updateInfoBox(info)
}

// This is the top sequence
sequence.add(new sequence.Sequence({
	name: "game",
	steps: [
		{
			name: "Welcome",
			start: function(seq) {
				updatePhase(seq)
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
				for (const s of ships) {
					s.m = ""
					s.idir = s.d
					s.mleft = 3
				}
				updatePhase(seq)
			},
		},
		{
			name: "Movement",
			start: updatePhase,
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
			start: sequence.proceed,
		},
		{
			name: "Melee",
			start: sequence.proceed,
		},
		{
			name: "Reoad",
			start: sequence.proceed,
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
	// Boxes 
	createInfoBox()
	updateInfoBox()
	// Map
	await map.init(sc.map)
	map.updateWindIndicator(g.wind)
	// Add ships
	ships = sc.ships
	await ship.init(ships)
	for (const s of ships) {
		ship.place(s, board)
		s.img.on('click', shipOnClick)
	}
	// Start game
	sequence.nextStep()
})()
