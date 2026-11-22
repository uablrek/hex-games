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
import {stepTurn, g, restore} from './game.js'

const log = console.log
const release = {version:"5.0.0-rc4", date:"2026-11-22"}
export let sc

// ----------------------------------------------------------------------
// User Interface (UI). Including keyboard, boxes, and clicks

// Keyboard
import {scroll as scrollMap} from './map.js'
ui.setKeys([
	{key: 'Enter', fn:nextStep},
	{key: ' ', fn:rotateStack},
	{key: 'i', fn:toggleInfo},
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
function toggleInfo(e) {
	if (infoBox.isVisible())
		infoBox.hide()
	else
		infoBox.show()
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
	// When we get here the UI is blocked and the cursor is 'wait'
	g.blockUI = false
	initializingBox.destroy()
	console.timeEnd("toImages")
}
function unitClick(e) {
	selected.u = unit.fromImg(e.target)
	selected.h = map.getHex(selected.u.hex)
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
export let infoBox
function createInfoBox() {
	infoBox = box.info({
		x: window.innerWidth - 310,
		y: 30,
		width: 300,
		height: 600,
		destroyable: false,
	})
	ui.info.add(infoBox)
}
export function updateInfo(txt='', env) {
	const step = sequence.currentSequence().currentStep
	const help = step.name ? ui.getHelp(step.name, env) : ''
	if (step.name) g.phase = step.name
	const label = step.name ? step.name : "Info"
	box.update(infoBox, help + txt, label)
}

export function isActive() {
	if (g.blockUI) return false
	if (!g.me) return true
	return g.me == g.active
}
let initializingBox
function initializing() {
	initializingBox = box.info({
		label: "Initializing...",
		width: 240,
		height: 50,
		destroyable: false,
	})
	initializingBox.position(ui.center(initializingBox))
	ui.info.add(initializingBox)
}

function initInput() {
	const brp = document.getElementById('brp')
	brp.addEventListener('change', checkInput)
	const nats = document.getElementsByName('nat')
	for (const nat of nats) nat.addEventListener('click', checkInput)
	checkInput({target:{}})
}
function checkInput(e) {
	let nat = "none"
	const radios = document.getElementsByName('nat')
	for (const b of radios) {
		if (b.checked) {
			nat = b.value
			break
		}
	}
	let brp = document.getElementById('brp')
	if (e.target.id == "brp")
		g.brp[nat] = brp.value
	else
		brp.value = g.brp[nat]
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
			}
		},
		{
			start: function(seq) {
				sequence.jump(seq, "server")
			}
		},
		{
			start: function(seq) {
				const s = localStorage.getItem("rdtr")
				if (g.mode == "solitarie" && s) {
					box.choiceBox({
						text: "A snapshot was found",
						choices: ['Use it', 'Discard'],
					}, ui.info, true).then(function(value) {
						if (value == "Use it") {
							if (restore(JSON.parse(s))) {
								checkInput({target:{}})
								return
							}
							log("Discarding obsolete save", s.version)
						}
						localStorage.removeItem("rdtr")
						sequence.nextStep()
					})
				} else seq.nextStep()
			}
		},
		{
			start: function(seq) {
				const ood = {deploy: sc.orderOfDeployment}
				sequence.jump(seq, "deployment", ood)
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
	// unit.toImages takes a lot of time on weak systems (4s on my old
	// laptop), So to prevent a gray screen on startup we make this
	// asynchronous, and show an "Initializing..." box
	console.time("startup")
	sc = sc1939
	const input = document.getElementById('input')
	ui.init({
		container: 'container',
		width: window.innerWidth,
		height: window.innerHeight - input.offsetHeight,
	})
	await initMap()				// show the map asap
	initializing()
	ui.parseHelp(helpTxt)
	initGame()
	initUnits()
	createInfoBox()
	initInput()
	setTimeout(function() {
		g.blockUI = true
		console.time("toImages")
		unit.toImages().then(setClicks)
		// restore in setClicks()
	})
	console.timeEnd("startup")
	// Start the game
	sequence.nextStep()
})()
