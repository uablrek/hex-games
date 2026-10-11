// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr

  Initiates modules and structures, then start the game sequence
*/

import Konva from 'konva'
import {ui, sequence, box, grid, map, unit} from '@uablrek/hex-games'
import sc1939 from './scenario-1939.json'
import helpTxt from './help.txt'
import {stepTurn, g} from './game.js'

const log = console.log
const release = {version:"5.0.0-rc1", date:"2026-10-11"}
export let sc

// ----------------------------------------------------------------------
// User Interface (UI). Including keyboard, boxes, adn clicks

// Keyboard
import {scroll as scrollMap} from './map.js'
ui.setKeys([
	{key: 'Enter', fn:nextStep},
	{key: ' ', fn:rotateStack},
	{key: 'r', fn:rotateStack},
	{key: 'ArrowUp', fn:scrollMap},
	{key: 'ArrowDown', fn:scrollMap},
	{key: 'ArrowLeft', fn:scrollMap},
	{key: 'ArrowRight', fn:scrollMap},
])
function nextStep() {
	if (!isActive()) return
	sequence.nextStep()
}
function rotateStack(e) {
	let pos = ui.board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	unit.rotateStack(hex)
}
// Clicks
export const selected = {
	u: null,
	h: null,
	fn: null,
}
function setClicks() {
	ui.board.on('click', boardClick)
	for (const u of unit.units) u.img.on('click', unitClick)
}
function unitClick(e) {
	selected.u = unit.fromImg(e.target)
	selected.h = map.getHex(selected.u.hex)
	log("unitClick", selected)
	// Prevent a unitClick to "bubble" up to a boardClick, or other units
	e.cancelBubble = true
	if (selected.fn) selected.fn()
}
function boardClick(e) {
	const pos = ui.board.getRelativePointerPosition()
	const hex = grid.pixelToHex(pos)
	selected.h = map.getHex(hex)
	selected.u = null
	if (selected.fn) selected.fn()
}

// Boxes
const info = new Konva.Layer({name: "info"})
export let infoBox
function createInfoBox() {
	infoBox = box.info({
		x: window.innerWidth - 310,
		y: 30,
		width: 300,
		height: 600,
		destroyable: false,
	})
	info.add(infoBox)
}
export function updateInfo(postTxt='', preTxt='', label) {
	const step = sequence.currentSequence().currentStep
	const help = step.name ? sequence.getSeqHelp(step.name) : ''
	if (step.name) g.phase = step.name
	if (!label) label = step.name ? step.name : "Info"
	box.update(infoBox, preTxt + help + postTxt, label)
}

export function isActive() {
	if (g.blockUI) return false
	if (!g.me) return true
	return g.me == g.active
}

// ----------------------------------------------------------------------
// Top sequence

sequence.add(new sequence.Sequence({
	name: "top",
	steps: [
		{
			name: "Welcome",
			start: function(seq) {
				updateInfo(`\n${release.version}, ${release.date}`)
				// OK to cache unit images when marks are not unsed
				// setTimeout() is used to prevent gray screen during init
				//setTimeout(()=>{for (const u of unit.units) u.img.cache()})
				//unit.toImages()
			}
		},
		{
			start: function(seq) {
				sequence.jump(seq, "server")
			}
		},
		{
			start: function(seq) {
				sequence.jump(seq, "deployment", {deploy: sc.orderOfDeployment})
			}
		},
		{
			name: "Next Turn",
			start: function(seq) {
				sequence.jump(seq, "turn")
			}
		},
		{
			start: function(seq) {
				stepTurn()
				seq.gotoStep("Next Turn")
			}
		},
		{
			name: "Game Ended",
			start: function(seq) {
				updateInfo()
			}
		}
	]
}), true)

// ----------------------------------------------------------------------
// Main
import {init as initGame} from './game.js'
import {init as initMap} from './map.js'
import {init as initUnits} from './units.js'
// These just add sequences
import './deployment.js'
import './server.js'

;(async () => {
	sc = sc1939
	ui.init()
	ui.stage.add(info)
	sequence.parseSeqHelp(helpTxt)
	await initMap()
	initUnits()
	unit.toImages()				// don't await, run in "background"
	initGame()
	createInfoBox()
	setClicks()
	// Start the game
	sequence.nextStep()
})()
