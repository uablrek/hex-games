// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/the-hill
*/

import Konva from 'konva'
import {ui, box, unit, sequence, map, grid, server} from '@uablrek/hex-games'
import * as ai from './ai.js'
import helpTxt from './help.txt'
import {g} from './game.js'
import {sendMsg} from './server.js'

const log = console.log
const release = {version:"5.0.0-rc4", date:"2026-11-22"}
let theInfoBox
export const testMode = true

// Info
export function updateInfo(key) {
	const m = String(g.turn.m).padStart(2, '0')
	ui.env.set("TURN", `${g.turn.h}:${m}`)
	ui.env.set("ACTIVE", `${g.player}`)
	let txt = ui.getHelp("header") + '\n\n'
	txt += ui.getHelp(key)
	box.update(theInfoBox, txt, key)
}

// Keyboard
ui.setKeys([
	{key:'h', fn:toggleHelpBox},
	{key:' ', fn: rotateStack},
	{key:'Enter', fn:nextStep },
	{key:'x', fn:nextStep },
	{key:'l', fn:lazy},
])

let theHelpBox
function toggleHelpBox() {
	if (!theHelpBox) {
		let txt = ui.getHelp("help")
		if (testMode)
			txt += "\n1-6 - Roll die (test mode)"
		theHelpBox = box.info({
			x: 400,
			y: 200,
			width: 300,
			label: "Help",
			destroyable: false,
			text: txt,
		})
		theHelpBox.hide()
		ui.board.add(theHelpBox)
	}
	if (theHelpBox.visible())
		theHelpBox.hide()
	else
		theHelpBox.show()
}
function rotateStack(e) {
	let pos = ui.board.getRelativePointerPosition()
	let hex = grid.pixelToHex(pos)
	unit.rotateStack(hex)
}
function nextStep(e) {
	if (g.phase == "Welcome") {
		sequence.nextStep()
		return
	}
	// blockUI is used on an EX combat result
	if (!isActive() || g.blockUI) return
	sequence.nextStep()
	// We can't send "nextStep" to the remote player in PvP here!
	// A reason is the deployment validation loop. The active player
	// may have to hit 'Enter' several times.
}
function lazy() {
	// Automatic play
	if (!isActive()) return
	//removeMarkers()
	ai.play()
}

// Click functions
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
	// Prevent a unitClick to "bubble" up to a boardClick, or other units
	e.cancelBubble = true
	//log("unitClick", selected)
	if (selected.fn) selected.fn(e) // 'this' will be the selected struct
}
function boardClick(e) {
	const pos = ui.board.getRelativePointerPosition()
	const hex = grid.pixelToHex(pos)
	selected.h = map.getHex(hex)
	selected.u = null
	//log("boardClick", selected)
	if (selected.fn) selected.fn(e)
}

export function isActive() {
	if (ai.busy) return false
	// g.me=='' for solitarie game
	return g.me == '' || g.me == g.player
}


// ----------------------------------------------------------------------
import {init as mapInit} from './map.js'
import {init as unitsInit} from './units.js'
import {init as gameInit} from './game.js'
import {init as serverInit} from './server.js'
;(async function() {
	g.board = ui.init()			// AI uses g.board (why?)
	await mapInit()
	await unitsInit()
	await gameInit()
	serverInit()
	ui.parseHelp(helpTxt)
	setClicks()
	ui.env.set("VERSION", `${release.version}, ${release.date}`)
	// Box
	theInfoBox = box.info({
		x: window.innerWidth - 500,
		y: 100,
		width: 400,
		height: 660,
		destroyable: false,
	})
	ui.board.add(theInfoBox)
	ai.init()					// call when g is initiated
	sequence.nextStep()
})()
