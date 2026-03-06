// SPDX-License-Identifier: CC0-1.0.
/*
  This is the UI module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr

  User Interface (UI) function are separated from the game module
  (rdtr.js).
*/

import Konva from 'konva'
import * as rdtr from './rdtr.js'
import * as unit from './rdtr-unit.js'
import * as map from './rdtr-map.js'
import * as images from './rdtr-images.js'
import {box, setup, sequence, grid} from './hex-games.js'
import shelp from './seq-help.txt'

export correctionMode = false
export var board
export async function init() {
	// Init Konva
	let input = document.getElementById('input')
	board = setup.stage({
		container: 'container',
		width: window.innerWidth,
		height: window.innerHeight - input.offsetHeight,
	})
	await map.load(board)
	let stage = board.getStage()
	let info = new Konva.Layer({
		x: 0,
		y: 0,
		name: "info",
	})
	stage.add(info)

	await unit.init(board)
	setup.setKeys(keyFn, keyUpFn)
	combatChartImage = await images.crt()
	sequence.parseSeqHelp(shelp)
	info.add(theInfoBox)
	return board
}

// Sctoll the board so "hex" becomes top-left
export function scrollBoard(hex) {
	if (hex.x < 0) hex.x = 0
	if (hex.y < 0) hex.y = 0
	hex = {x:-hex.x, y:-hex.y}
	let pos = grid.hexToPixel(hex)
	if (hex.x == 0) pos.x = 0
	if (hex.y == 0) pos.y = 0
	new Konva.Tween({
		node: board,
		x: pos.x,
		y: pos.y,
		duration: 0.5,
		easing: Konva.Easings.EaseInOut,
	}).play()		
}

// ----------------------------------------------------------------------
// User Interface. A <p id="input"> at the bottom of the page.
// initUI must be called *after* loadSave/loadScenario because the
// "game" variable is used
export function initUI() {
	for (const n of document.getElementsByName('nat')) {
		n.addEventListener('click', checkNatUI)
	}
	let brp = document.getElementById('brp')
	brp.addEventListener('change', checkBrpUI)
	rdtr.g.uiNat = "ge"
	console.log(rdtr.g.status.ge)
	brp.value = rdtr.g.status.ge.brp
}
function checkNatUI(e) {
	let nat = e.target.value
	rdtr.g.uiNat = nat
	let brpElement = document.getElementById('brp')
	brpElement.value = rdtr.g.status[nat].brp
}
function checkBrpUI(e) {
	//rdtr.g.uiValue = e.target.value
	rdtr.g.status[rdtr.g.uiNat].brp = e.target.value
}
// Call to update BRP in the UI if it's visible. E.g. after DoW, or
// unit buy
function updateBrpUI(natUpdated) {
	let nat
	const radios = document.getElementsByName('nat')
	for (const b of radios) {
		if (b.checked) {
			nat = b.value
			break
		}
	}
	if (nat == natUpdated) {
		let brpElement = document.getElementById('brp')
		brpElement.value = game.nat[nat].brp
	}
}

// ----------------------------------------------------------------------
// Keyboard

const keyFn = [
	{key:'Shift', fn:deleteModeOn},
	{key:'s', fn:rdtr.saveGame},
	{key:'j', fn:rdtr.saveJSON},
	{key:'a', fn:()=>{ new unit.UnitBoxAir }},
	{key:'f', fn:()=>{ new unit.UnitBoxNav }},
	{key:'h', fn:createHelpBox},
	{key:'c', fn:()=>{ new CombatBox({ board: board, }) }},
	{key:' ', fn:rollStack},
	{key:'Enter', fn:rdtr.nextStep},
	//{key:'r', fn:regretMove},
]
const keyUpFn = [
	{key:'Shift', fn:deleteModeOff}
]

// Set moveToTop as dragstart by default for unit images
function moveToTop(e) {
	e.target.moveToTop()
	selectedUnit = unit.fromImage(e.target)
}
let deleteMode = false
function deleteModeOn() {
	deleteMode = true
	board.getStage().container().style.cursor = 'not-allowed'
}
function deleteModeOff() {
	deleteMode = false
	board.getStage().container().style.cursor = 'default'
}
function unitClicked(e) {
	let u = unit.fromImage(e.target)
	if (deleteMode) {
		map.removeUnit(u)
		u.img.remove()
	} else
		selectedUnit = u
		
}
function rollStack(e) {
	const pos = board.getRelativePointerPosition()
	let hex = map.pixelToHex(pos)
	selectedUnit = unit.rotateStack(hex)
}
function regretMove(e) {
	console.log(selectedUnit)
	unit.regretMove(selectedUnit)
}

// ----------------------------------------------------------------------
// Boxes

// Adjust position so a box is visible even if the board is dragged
export function adjustBoxPos(pos) {
	return {x: pos.x - board.x(), y: pos.y - board.y()}
}

let theInfoBox = box.info({
	label: "Info",
	x: 40,
	y: 20,
	width: 350,
	height: 400,
	destroyable: false,
})
export function updateInfo(g, info) {
	let txt = `Turn: ${g.turn.year}, ${g.turn.season}\n`
	txt += `Player: ${g.player}\n`
	txt += `Phase: ${g.phase}\n`
	if (g.front) txt += `Front: ${g.front}, ${g.action}\n`
	if (info) txt += info
	const key = `${g.seq.name}/${g.phase}`
	const phaseHelp = sequence.getSeqHelp(key)
	if (phaseHelp) txt += ('\n'+ phaseHelp)
	box.update(theInfoBox, txt)
}

let helpBox = null
function createHelpBox() {
	const help =
		"s - Save\n" +
		"a - Air exchange counters\n" +
		"f - Fleet exchange counters\n" +
		"c - Combat chart (with die)\n" +
		"j - Save deployment as json\n" +
		"' ' - Rotate stack\n" +
		"Enter - Next Phase\n" 
	if (helpBox) return
	helpBox = box.info({
		label: "Help",
		text: help,
	})
	helpBox.position(adjustBoxPos({x:400, y:200}))
	board.add(helpBox)
}
let choiceCallback
let choiceCallbackRef
export function setChoiceCallback(fn, ref) {
	choiceCallback = fn
	choiceCallbackRef = ref
}
function destroyBox(e, group) {
	if (e == helpBox) {
		helpBox = null
		return
	}
	if (group.name() == "X") return
	if (choiceCallback)
		return choiceCallback(group.name(), choiceCallbackRef)
}
box.destroyCallback(destroyBox)

// CombatBox
// A box with the combat chart, and a die
let theCombatBox
let combatChartImage
class CombatBox {
	x = 400
	y = 100
	board			// "this" is placed on this layer
	#box
	#text
	#rollCnt = 0
	#scale = 0.7
	constructor(obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				this[prop] = obj[prop];
			}
		}
		if (theCombatBox) {
			alert("Multiple CombatBox'es NOT allowed")
			return
		}
		theCombatBox = this
		// We want the pop-up box to be visible on screen even if the
		// board is dragged. So, compensate for the board position
		let pos = this.board.position()
		this.#box = new Konva.Group({
			x: this.x - pos.x,
			y: this.y - pos.y,
			scale: {x: this.#scale, y: this.#scale},
			draggable: true,
		})
		this.#box.on('dragstart', moveToTop)
		this.#box.add(combatChartImage)
		let close = box.X.clone({
			x: combatChartImage.width() - 40,
			y: 15,
			scale: {x:0.35,y:0.35},
		})
		box.setStrokeX(close, 'black')
		this.#box.add(close)
		close.on('click', CombatBox.#destroy)
		let dieBox = new Konva.Rect({
			x: 0,
			y: combatChartImage.height(),
			width: combatChartImage.width(),
			height: 50,
			fill: 'black',
		})
		this.#box.add(dieBox)
		this.#text = new Konva.Text({
			x: 200,
			y: dieBox.y() + 6,
			fontSize: 32,
			fontStyle: 'bold',
			fill: 'white',
		})
		this.#text.text("Click to roll!")
		this.#text.on('click', CombatBox.#letsRoll)
		this.#box.add(this.#text)
		this.board.add(this.#box)
	}
	#roll() {
		this.#rollCnt++
		let r = Math.floor(Math.random() * 6) + 1
		this.#text.text(`Click to roll (${this.#rollCnt}): ${r}`)
	}
	// This is a 'click' event callback on the die text
	static #letsRoll() {
		theCombatBox.#roll()
	}
	destroy() {
		// Clear the singleton reference
		theCombatBox = null
		// Remove the combat chart image
		combatChartImage.remove()
		// destroy the group (and all remaining childs)
		// It is assumed that all eventHandlers are deleted too
		this.#box.destroy()
	}
	// This is a 'click' event callback
	static #destroy(e) {
		theCombatBox.destroy()
	}
}
