// SPDX-License-Identifier: CC0-1.0.
/*
  This is the library module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
*/

import Konva from 'konva';
import * as unit from './units.js';
import * as map from './rdtr-map.js';
import * as box from './textbox.js';

// Enable testing with node.js
var newImage = function() { return new Image() }
if (localStorage.getItem("nodejsTest") == "yes") {
	newImage = function() { return {} }
}

// Set the stage
var turn = { year: 0, season: "none" }
export var stage;
export var board;
export async function setStage(container) {
	stage = new Konva.Stage({
		container: container,
		width: window.innerWidth,
		height: window.innerHeight,
	});
	board = new Konva.Layer({
		draggable: true,
	});
	stage.add(board)
	await map.load(board)

	stage.container().tabIndex = 1
	stage.container().focus();
	stage.container().addEventListener("keydown", keydown)
	stage.container().addEventListener("keyup", (e) => {
		if (e.key == "Shift") {
			deleteModeOff()
		}
	})
}

// Adjust position so a box is visible even if the board is dragged
function adjustBoxPos(pos) {
	return {x: pos.x - board.x(), y: pos.y - board.y()}
}
const help =
	"Shift-click - Remove unit\n" +
	"s - Save\n" +
	"b - Buy counters\n" +
	"a - Air exchange counters\n" +
	"f - Fleet exchange counters\n" +
	"n - Deploy neutrals and minor allies\n" +
	"t - Show current turn\n" +
	"T - Next turn\n" +
	"c - Combat chart (with die)\n"

let helpBox = null
function createHelpBox() {
	if (helpBox) return
	helpBox = box.info("Help", help)
	helpBox.position(adjustBoxPos({x:400, y:200}))
	board.add(helpBox)
}
let turnBox = null
function createTurnBox() {
	if (turnBox) return
	const t = `Year: ${turn.year}, Season: ${turn.season}`
	turnBox = box.info("Current turn", t, {
		width: 300,
		height: 60,
		fontSize: 20,
	})
	turnBox.position(adjustBoxPos({x:200, y:100}))
	board.add(turnBox)
}
function updateTurnBox(newAB) {
	if (!turnBox) return
	let txtObj = turnBox.findOne('.text')
	let t = `Year: ${turn.year}, Season: ${turn.season}`
	if (newAB) t += "\nNew Allowable Builds!"
	txtObj.text(t)
}
function destroyBox(e) {
	if (e == helpBox) helpBox = null
	if (e == turnBox) turnBox = null
}
box.destroyCallback(destroyBox)

function keydown(e) {
	if (e.key == "Shift") {
		deleteModeOn()
		return
	}
	if (e.key == "S" || e.key == "s") {
		if (e.repeat) return
		saveGame()
		deleteModeOff()			// 'Shift' trigs deleteMode
		return
	}
	if (e.key == "b") {
		if (e.repeat) return
		new unit.UnitBoxMajor({
			board: board,
			text: "Allowable Builds",
		})
		return
	}
	if (e.key == "a") {
		if (e.repeat) return
		new unit.UnitBoxAir({
			board: board,
		})
		return
	}
	if (e.key == "f") {
		if (e.repeat) return
		new unit.UnitBoxNav({
			board: board,
		})
		return
	}
	if (e.key == "n") {
		if (e.repeat) return
		new unit.UnitBoxNeutrals({
			board: board,
		})
		return
	}
	if (e.key == "h") {
		if (e.repeat) return
		createHelpBox()
		return
	}
	if (e.key == "t") {
		if (e.repeat) return
		createTurnBox()
		return
	}
	if (e.key == "T") {
		if (e.repeat) return
		let newAB = stepTurn()
		createTurnBox()
		updateTurnBox(newAB)
		return
	}
	if (e.key == "c") {
		if (e.repeat) return
		new CombatBox({
			board: board,
		})
		return
	}
}

// Set moveToTop as dragstart by default for unit images
function moveToTop(e) {
	e.target.moveToTop()
}
var deleteMode = false
function deleteModeOn() {
	deleteMode = true
	stage.container().style.cursor = 'not-allowed'
}
function deleteModeOff() {
	deleteMode = false
	stage.container().style.cursor = 'default'
}
var unitHex
function unitClicked(e) {
	let u = unit.fromImage(e.target)
	if (deleteMode) {
		unit.removeFromMap(u)
		return
	}
	unitHex = u.hex
}
for (const [i, u] of unit.units.entries()) {
	u.img.on('dragstart', moveToTop)
	u.img.on('click', unitClicked)
}

function stepTurn() {
	switch (turn.season) {
	case "spring":
		turn.season = "summer"
		break
	case "summer":
		turn.season = "fall"
		break
	case "fall":
		turn.season = "winter"
		break
	case "winter":
		turn.season = "spring"
		turn.year = turn.year + 1
		break
	}
	// When the turn is stepped, we must check is new allowableBuilds
	// become available. If so, we add them to allowableBuilds[0].
	// (the "consumed" entry is kept since it does no harm)
	for (let i = 1; i < game.allowableBuilds.length; i++) {
		if (turnEq(turn, game.allowableBuilds[i].turn)) {
			let units = game.allowableBuilds[i].units
			for (const d of units) {
				for (let i = 0; i < d.cnt; i++) {
					let u = unit.fromStr(d.type)
					if (!u) {
						console.log(`Unknown unit ${d.type}`)
					} else {
						u.allowable = true
					}
				}
			}
			return true
		}
	}
	return false	
}
function turnEq(t1, t2) {
	if (t1.year != t2.year) return false
	if (t1.season != t2.season) return false
	return true
}

// ----------------------------------------------------------------------
// Save & Restore related

/*
  Save data is in JSON, and MUST have a "version" element with a
  number (no semantic versioning, just an int).

  This describes version: 2

  The "type" element can be scenario|save

  A "scenario" type shows an empty map and an initialDeployment
  UnitBox.

  Once the Initial Deployment is done you can (and should) save.

  The current "allowableBuilds" MUST be the first,
  i.e. game.allowableBuilds[0].

  A type "save" has no "initialDeployment", but they have a
  "deployment" with all units on the map. The current
  "allowableBuilds" contains individual units (cnt=1) with labels
  (lbl) where they exist.

  The future "allowableBuilds" (with a "turn" elemnt) are kept as-is
  from the "scenario" save. When the turn matches, they are added to
  the current "allowableBuilds".
 */

// The version of scenario/save files
export const version = 2
// Game data from load scenario/save
var game;


// This should only be called if no save exist
export function loadScenario(gameObject) {
	game = gameObject
	if (game.version != 2) {
		alert(`Unsupported version ${game.version}`)
		return
	}
	turn = game.turn
	if (game.type != "scenario") {
		alert(`Not a scenario, but ${game.type}`)
		return
	}
	for (const d of game.initialDeployment) {
		for (let i = 0; i < d.cnt; i++) {
			let u = unit.fromStr(d.type)
			u.allowable = true
		}
	}
	delete game.initialDeployment // not included in sub-sequent saves

	new unit.UnitBoxMajor({
		board: board,
		neutrals: true,
		text: game.scenario + " Initial Deployment",
	})

	// Mark units from default allowableBuilds (index==0)
	for (const d of game.allowableBuilds[0].units) {
		for (let i = 0; i < d.cnt; i++) {
			let u = unit.fromStr(d.type)
			if (!u) alert(`No unit for ${d.type}`)
			u.allowable = true
		}
	}
}
export function loadSave() {
	game = JSON.parse(rdtrSaveData)
	turn = game.turn
	deploy(game.deployment.units)
	// Mark units from default allowableBuilds (index==0)
	unit.unselectAll()
	for (const d of game.allowableBuilds[0].units) {
		// (cnt should always be 1 here)
		for (let i = 0; i < d.cnt; i++) {
			// include units on-map
			let u = unit.fromStr(d.type, offmap=false)
			if (!u) alert(`No unit for ${d.type}`)
			u.allowable = true
		}
	}
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

export function saveGame(name = "rdtrSaveData.js") {
	if (!game) {
		game = {
			version: version,
			allowableBuilds: [null],
		}
	}
	game.type = "save"
	game.turn = turn
	game.deployment = getDeplyment()
	// Replace the current "allowableBuilds"
	let abuilds = {units: []}
	for (let u of unit.units) {
		if (!u.allowable) continue
		abuilds.units.push({cnt:1, type:unit.toStr(u)})
	}
	game.allowableBuilds[0] = abuilds
	const json = JSON.stringify(game)
	const js = `const rdtrSaveData = '${json}'`
	const blob = new Blob([js], { type: 'text/javascript' });
	download(blob, name)
}
// Returns an array of all units on the map
export function getDeplyment() {
	let dep = { units: [] }
	for (const u of unit.units) {
		if (!u.hex) continue
		dep.units.push({
			u: unit.toStr(u), hex: map.hexToRdtr(u.hex)
		})
	}
	return dep
}
export function deploy(units) {
	let notFound = []
	for (const ud of units) {
		let u = unit.fromStr(ud.u)
		if (!u) {
			notFound.push(ud.u)
		} else {
			unit.placeRdtr(u, ud.hex, board)
		}
	}
	if (notFound.length) alert(`Not found: ${notFound}`)
}

// ----------------------------------------------------------------------
// CombatBox
// A box with the combat chart, and a die

let theCombatBox
const X = newImage()
X.src = "data:image\/svg+xml,<svg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" xmlns=\"http://www.w3.org/2000/svg\"> <rect x=\"2\" y=\"2\" width=\"76\" height=\"76\" fill=\"none\" stroke=\"black\" stroke-width=\"4\"/> <path d=\"M 15 15 L 65 65 M 15 65 L 65 15\" stroke=\"black\" stroke-width=\"10\" fill=\"none\"/> </svg>"

const combatChartData = newImage()
combatChartData.src = './rdtr-combat-chart.png'
const combatChartImage = new Konva.Image({
	x: 0,
	y: 0,
	image: combatChartData,
})

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
		let close = new Konva.Image({
			x: combatChartImage.width() - 40,
			y: 15,
			image: X,
			scale: {x:0.3,y:0.3},
		})
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
