// SPDX-License-Identifier: CC0-1.0.
/*
  This is the library module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
*/

import Konva from 'konva';
import * as unit from './rdtr-unit.js'
import * as map from './rdtr-map.js'
import {box, setup} from './hex-games.js'

// Enable testing with node.js
var newImage = function() { return new Image() }
if (typeof document == 'undefined') newImage = function() { return {} }

// User Interface. A <p id="input"> at the bottom of the page.
// initUI must be called *after* loadSave/loadScenario because the
// "game" variable is used
export function initUI() {
	for (const n of document.getElementsByName('nat')) {
		n.addEventListener('click', checkNatUI)
	}
	let brp = document.getElementById('brp')
	brp.addEventListener('change', checkBrpUI)
	brp.value = game.nat.ge.brp
}
function checkNatUI(e) {
	let nat = e.target.value
	let brpElement = document.getElementById('brp')
	brpElement.value = game.nat[nat].brp
}
function checkBrpUI(e) {
	let nat
	const radios = document.getElementsByName('nat')
	for (const b of radios) {
		if (b.checked) {
			nat = b.value
			break
		}
	}
	game.nat[nat].brp = e.target.value
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

// Set the stage
var turn = { year: 0, season: "none" }
var board
export async function setStage(container) {
	// Init Konva
	let input = document.getElementById('input')
	board = setup.stage({
		container: container,
		width: window.innerWidth,
		height: window.innerHeight - input.offsetHeight,
	})
	await map.load(board)
	await unit.init(board)
	for (const u of unit.units) {
		u.img.on('dragstart', moveToTop)
		u.img.on('click', unitClicked)
	}
	setup.setKeys(keyFn, keyUpFn)
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
	"c - Combat chart (with die)\n" +
	"j - Save deployment as json\n" +
	"' ' - Rotate stack"

let helpBox = null
function createHelpBox() {
	if (helpBox) return
	helpBox = box.info({
		label: "Help",
		text: help,
	})
	helpBox.position(adjustBoxPos({x:400, y:200}))
	board.add(helpBox)
}
let turnBox = null
function createTurnBox() {
	if (turnBox) return
	const t = `Year: ${turn.year}, Season: ${turn.season}`
	turnBox = box.info({
		width: 300,
		height: 110,
		fontSize: 20,
		label: "Current turn",
		text: t,
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

const keyFn = [
	{key:'Shift', fn:deleteModeOn},
	{key:'s', fn:saveGame},
	{key:'b', fn:()=>{
		new unit.UnitBoxMajor({
			text: "Allowable Builds",
		})
	}},
	{key:'a', fn:()=>{ new unit.UnitBoxAir }},
	{key:'f', fn:()=>{ new unit.UnitBoxNav }},
	{key:'n', fn:()=>{ new unit.UnitBoxNeutrals }},
	{key:'h', fn:createHelpBox},
	{key:'t', fn:createTurnBox},
	{key:'T', fn:()=>{
		let newAB = stepTurn()
		createTurnBox()
		updateTurnBox(newAB)
		deleteModeOff()
	}},
	{key:'c', fn:()=>{ new CombatBox({ board: board, }) }},
	{key:' ', fn:rollStack},
	{key:'j', fn:saveJSON},
]
const keyUpFn = [
	{key:'Shift', fn:deleteModeOff}
]
// Set moveToTop as dragstart by default for unit images
function moveToTop(e) {
	e.target.moveToTop()
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
		unit.removeFromMap(u)
		return
	}
}
function rollStack(down) {
	const pos = board.getRelativePointerPosition()
	let hex = map.pixelToHex(pos)
	let h = map.getHex(hex)
	if (!h || !h.units || h.units.size < 2) return
	let minZ = 1000000, bot
	for (u of h.units) {
		let z = u.img.zIndex()
		if (z < minZ) {
			bot = u
			minZ = z
		}
	}
	bot.img.moveToTop()
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
					let u = unit.fromStr(d.type, (u)=>u.allowable)
					if (!u) {
						console.log(`Unit not found ${d.type}`)
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

// The player with most BRP is first
let lastTurnFirstPlayer
function firstPlayer() {
	if (game.scenario.includes("1939") || game.scenario.includes("Campaign")) {
		if (turnEq(game.turn, { "year": 1939, "season": "fall"})) {
			lastTurnFirstPlayer = "axis"
			return lastTurnFirstPlayer
		}
	}
	// TODO: add 1942 and 1944 starts here
	// Germany and Italy are always summed together, even when Italy
	// is neutral. and if conquered, brp would be 0
	let axisBrp = game.nat.ge.brp + game.nat.it.brp
	// It's safe to start with UK and France. If conquered, brp would be 0
	let alliesBrp = game.nat.ge.uk + game.nat.ge.fr
	if (game.nat.su.war.includes("ge")) alliesBrp += game.nat.su.brp
	if (game.nat.us.war.includes("ge")) alliesBrp += game.nat.us.brp
	if (axisBrp == axisBrp) return lastTurnFirstPlayer
	if (axisBrp > axisBrp)
		lastTurnFirstPlayer = "axis"
	else
		lastTurnFirstPlayer = "allies"
	return lastTurnFirstPlayer
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
  i.e. game.allowableBuilds[0].

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

// The version of scenario/save files
export const version = 4
// Game data from load scenario/save
var game

export function loadScenario(gameObject) {
	game = gameObject
	if (game.type != "scenario") {
		alert(`Not a scenario, but ${game.type}`)
		return
	}
	if (game.version != 4) {
		alert(`Unsupported version ${game.version}`)
		return
	}
	turn = game.turn
	unit.unselectAll()
	for (const d of game.initialDeployment) {
		for (let i = 0; i < d.cnt; i++) {
			// Filter out already selected
			let u = unit.fromStr(d.type, (u)=>u.selected)
			u.allowable = true
		}
	}
	delete game.initialDeployment // not included in sub-sequent saves
	if (game.deployment) {
		// Forced or helpful deployment
		// NOTE: it *may* not be possible to deploy all units if they
		//   haven't become "allowable", but never mind
		unit.unselectAll()
		let filterOut = function(u) {
			if (u.selected) return true
			if (u.nat == 'nu') return false
			return !u.allowable
		}
		deploy(game.deployment.units, filterOut)
		delete game.deployment
	}
	// All allowable, and not placed units displayed
	new unit.UnitBoxMajor({
		neutrals: true,
		text: game.scenario + " Initial Deployment",
	})
	// Mark units from default allowableBuilds (index==0)
	for (const d of game.allowableBuilds[0].units) {
		for (let i = 0; i < d.cnt; i++) {
			// Filter out already allowable
			let u = unit.fromStr(d.type, (u)=>u.allowable)
			if (!u) alert(`No unit for ${d.type}`)
			u.allowable = true
		}
	}
	game.allowableBuilds[0].units = [] // will be restored in saveGame()
}
export function loadSave() {
	game = JSON.parse(rdtrSaveData)
	if (game.version != 4) {
		alert(`Unsupported version ${game.version}`)
		return
	}
	turn = game.turn
	// Mark units from default allowableBuilds (index==0)
	let allowableBuilds = game.allowableBuilds[0].units
	game.allowableBuilds[0].units = []
	unit.unselectAll()
	for (const d of allowableBuilds) {
		// d.cnt is always 1 here since we always save individual units
		if (d.cnt != 1) alert(`BUG: ${d.type}, cnt=${d.cnt}`)
		let u = unit.fromStr(d.type, (u)=>u.selected)
		if (!u) alert(`BUG: No unit for ${d.type}`)
		u.allowable = true
	}
	// Units to deploy may be neutrals or allowable. Minor allies must
	// be allowable
	unit.unselectAll()
	let filterOut = function(u) {
		if (u.selected) return true
		if (['nu','sp','tu','iq'].includes(u.nat)) return false
		return !u.allowable
	}
	if (!deploy(game.deployment.units, filterOut))
		alert("BUG: couldn't deploy some units")
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
// Save the deployment as JSON
export function saveJSON(name = "rdtr-deployment.json") {
	const json = JSON.stringify(getDeplyment())
	const blob = new Blob([json], { type: 'application/json' })
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
export function deploy(units, filterOut) {
	let notFound = []
	for (const ud of units) {
		let u = unit.fromStr(ud.u, filterOut)
		if (!u) {
			notFound.push(ud.u)
			continue
		}
		unit.placeRdtr(u, ud.hex)
	}
	if (notFound.length) {
		console.log(`Not found: ${notFound}`)
		return false
	}
	return true
}

// Debug function
function checkUnits(msg = "") {
	let ecnt=0, dcnt=0, acnt=0, err=[]
	for (const u of unit.units) {
		if (['nu','sp','tu','iq'].includes(u.nat)) continue
		if (u.hex) {
			dcnt++
			if (!u.allowable) {
				err.push(unit.toStr(u))
				ecnt++
			}
		}
		if (u.allowable) acnt++
	}
	console.log(`${msg}: dcnt=${dcnt}, acnt=${acnt}, ecnt=${ecnt} ${err}`)
}

// ----------------------------------------------------------------------
// CombatBox
// A box with the combat chart, and a die

let theCombatBox
const X = newImage()
X.src = 'data:image/svg+xml,<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"> <rect x="2" y="2" width="76" height="76" fill="none" stroke="black" stroke-width="4"/> <path d="M 15 15 L 65 65 M 15 65 L 65 15" stroke="black" stroke-width="10" fill="none"/></svg>'

const combatChartImg = newImage()
import combatChartData from './rdtr-combat-chart.png'
combatChartImg.src = combatChartData
const combatChartImage = new Konva.Image({
	x: 0,
	y: 0,
	image: combatChartImg,
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
