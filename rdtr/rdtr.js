// SPDX-License-Identifier: CC0-1.0.
/*
  This is the library module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
*/

import Konva from 'konva';
import * as unit from './units.js';

// Enable testing with node.js
var newImage = function() { return new Image() }
if (localStorage.getItem("nodejsTest") == "yes") {
	newImage = function() { return {} }
}

// Set the stage
var shift = false
var selected = null
var turn = { year: 0, season: "none" }
export var stage;
export var board;
export function setStage(container) {
	stage = new Konva.Stage({
		container: container,
		width: window.innerWidth,
		height: window.innerHeight,
	});
	board = new Konva.Layer({
		draggable: true,
	});
	stage.add(board);
	board.add(map);

	stage.container().tabIndex = 1
	stage.container().focus();
	stage.container().addEventListener("keydown", keydown)
	stage.container().addEventListener("keyup", (e) => {
		if (e.key == "Shift") shift = false
	})
}

let help =
	"Shift-click - Remove unit\n" +
	"Shift-S - Save\n" +
	"b - Buy counters\n" +
	"a - Air exchange counters\n" +
	"f - Fleet exchange counters\n" +
	"n - Deploy neutrals and minor allies\n" +
	"t - Show current turn\n" +
	"T - Next turn"

function keydown(e) {
	if (e.key == "Shift") {
		shift = true
		return
	}
	if (e.key == "S") {
		if (e.repeat) return
		saveGame()
		return
	}
	if (e.key == "b") {
		if (e.repeat) return
		new UnitBoxMajor({
			x: 400,
			y: 100,
			board: board,
			neutrals: false,
			text: "Allowable Builds",
		})
		return
	}
	if (e.key == "a") {
		if (e.repeat) return
		new UnitBoxAir({
			x: 400,
			y: 100,
			board: board,
		})
		return
	}
	if (e.key == "f") {
		if (e.repeat) return
		new UnitBoxNav({
			x: 400,
			y: 100,
			board: board,
		})
		return
	}
	if (e.key == "n") {
		if (e.repeat) return
		new UnitBoxNeutrals({
			x: 400,
			y: 100,
			board: board,
		})
		return
	}
	if (e.key == "h") {
		if (e.repeat) return
		new InfoBox({
			x: 300,
			y: 300,
			label: "Help",
			text: help,
			board: board,
		})
		return
	}
	if (e.key == "t") {
		if (e.repeat) return
		new InfoBox({
			x: 300,
			y: 300,
			label: "Current turn",
			text: `Year: ${turn.year}, Season: ${turn.season}`,
			board: board,
		})
		return
	}
	if (e.key == "T") {
		if (e.repeat) return
		let newAB = stepTurn()
		let txt = `Year: ${turn.year}, Season: ${turn.season}`
		if (newAB) txt += "\nNew AllowabeBuilds"
		new InfoBox({
			x: 300,
			y: 300,
			label: "Current turn",
			text: txt,
			board: board,
		})
		return
	}
}

// Set moveToTop as dragstart by default for unit images
function moveToTop(e) {
	e.target.moveToTop()
}
function selectOrDelete(e) {
	let u = unit.fromImage(e.target)
	if (shift) {
		unit.removeFromMap(u)
		if (selected == u) selected = null
	} else {
		selected = u
	}
}
for (const [i, u] of unit.units.entries()) {
	u.img.on('dragstart', moveToTop)
	u.img.on('click', selectOrDelete)
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
// Map

const hsize = 58.7;				// --size to hex.py
const hscale = 0.988;			// --scale to hex.py
const rsize = hsize * hscale * Math.sqrt(3) / 2;  // row interval
const grid_offset = {x:57, y:23}  // 0,0 on the map image
const unitOffset = 23			  // To adjust the unit image on a hex

// The Map image
const imageObj = newImage();
imageObj.src = './rdtr-map.png'
export const map = new Konva.Image({
    image: imageObj,
});

// Hex Coordinate Functions:
// The pixel functions uses offset coordinates (hex) for "pointy"
// hexes. They take --scale into account.
export function pixelToHex(pos) {
	// This function is NOT perfect! A click near the top/bottom of a
	// hex *may* select an adjacent hex. But for practical use, it's
	// good enough.

	// Adjust for grid/map offset
	pos = {x:pos.x + grid_offset.x, y:pos.y + grid_offset.y}
	let x, y = Math.round(pos.y / rsize - 0.42) // 0.42 ~= 5/12
	if (y % 2 == 0) {
		x = Math.round(pos.x / hsize)
	} else {
		x = Math.round(pos.x / hsize - 0.5)
	}
	return({x:x, y:y});
}
export function hexToPixel(hex) {
	let x, y = Math.round(hex.y * rsize + rsize/3)
	if (hex.y % 2 == 0) {
		x = Math.round(hex.x * hsize)
	} else {
		x = Math.round(hex.x * hsize + (hsize/2))
	}
	// Adjust for grid/map offset
	return({x:x - grid_offset.x, y:y - grid_offset.y});
}
export function hexToAxial(hex) {
	let q
	if (hex.y % 2 == 0) {
		q =  hex.x - hex.y / 2
	} else {
		q = hex.x - (hex.y - 1) / 2
	}
	return {q: q, r: hex.y}
}
export function axialToHex(ax) {
	let x
	if (ax.r % 2 == 0) {
		x = ax.q + ax.r / 2
	} else {
		x = ax.q + (ax.r - 1) / 2
	}
	return {x:x, y: ax.r}
}
// RDTR uses letters A-KK for row, and a positive int for q.
export function axialToRdtr(ax) {
	if (ax.r < 27) {
		r = String.fromCharCode(ax.r + 64)
	} else {
		let c = ax.r + 38
		r = String.fromCharCode(c, c)
	}
	return {q: ax.q + 15, r: r}
}
export function rdtrToAxial(rc) {
	r = rc.r.charCodeAt(0) - 64
	if (rc.r.length > 1) {
		r += 26
	}
	return {q: rc.q - 15, r: r}
}
export function rdtrToHex(rc) {
	return axialToHex(rdtrToAxial(rc))
}
export function hexToRdtr(hex) {
	return axialToRdtr(hexToAxial(hex))
}

// Unit placement functions:
export function unitPixelPos(hex) {
	let h = hexToPixel(hex)
	return {x: h.x - unitOffset, y: h.y - unitOffset}
}
export function unitPlace(u, hex, parent = board) {
	u.hex = hex
	px = unitPixelPos(hex)
	if (unitStack(hex)) px = stackAdjust(px)
	u.img.x(px.x)
	u.img.y(px.y)
	u.img.on('dragend', unitSnapToHex)
	parent.add(u.img)
}
export function unitPlaceRdtr(u, rc, parent = board) {
	unitPlace(u, rdtrToHex(rc), parent)
}
// This function should be called after the user has placed a unit,
// for instance from 'dragend'.
export function unitSnapToHex(e) {
	let img = e.target
	// Get the unit object from the image
	let u = unit.fromImage(img)
	// The unit img coordinate is top-left, adjust to center
	let pos = {x:img.x() + unitOffset, y:img.y() + unitOffset}
	// Get the hex, and update the unit object
	hex = pixelToHex(pos)
	u.hex = hex
	// Snap!
	pos = unitPixelPos(hex)		// adjusted pos
	if (unitStack(hex)) pos = stackAdjust(pos)
	img.position(pos)
}
function posEqual(a, b) {
	if (a.x != b.x) return false
	if (a.y != b.y) return false
	return true
}
function unitStack(hex) {
	let unitCount = 0
	for (u of unit.units) {
		if (u.hex && posEqual(u.hex, hex)) {
			unitCount++
			if (unitCount > 1) return true
		}
	}
	return false
}
function stackAdjust(pos) {
	let offset = 4
	return {x:pos.x - offset, y:pos.y - offset}
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

	new UnitBoxMajor({
		x: 400,
		y: 100,
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
			u: unit.toStr(u), hex: hexToRdtr(u.hex)
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
			unitPlaceRdtr(u, ud.hex)
		}
	}
	if (notFound.length) alert(`Not found: ${notFound}`)
}

// ----------------------------------------------------------------------
// Unit Box
// A draggable shaded box with units (prototype in "deployment-demo.js")
// TODO: move UnitBox to "units.js"?

// A traditional "close" button
let X = newImage()
X.src = "data:image\/svg+xml,<svg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" xmlns=\"http://www.w3.org/2000/svg\"> <rect x=\"2\" y=\"2\" width=\"76\" height=\"76\" fill=\"none\" stroke=\"white\" stroke-width=\"4\"/> <path d=\"M 15 15 L 65 65 M 15 65 L 65 15\" stroke=\"white\" stroke-width=\"10\" fill=\"none\"/> </svg>"

// Singelton for now
let theUnitBox

export class UnitBox {
	rows = 1
	cols = 4
	x = 200
	y = 200
	text = "Units"
	board			// "this" and dragged units are placed on this layer
	#sizeC = 60
	#sizeR = 70
	#offsetX = 20
	#offsetY = 50
	#box
	#units = new Set()
	#X							// the "destroy" image
	constructor(obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				this[prop] = obj[prop];
			}
		}
		if (theUnitBox) {
			alert("Multiple UnitBox'es NOT allowed")
			return
		}
		theUnitBox = this
		// We want the pop-up box to be visible on screen even if the
		// board is dragged. So, compensate for the board position
		let pos = this.board.position()
		this.#box = new Konva.Group({
			x: this.x - pos.x,
			y: this.y - pos.y,
			draggable: true,
		})
		this.#box.on('dragstart', moveToTop)
		let width = this.cols * this.#sizeC + this.#offsetX
		this.#box.add(new Konva.Rect({
			x: 0,
			y: 0,
			width: width,
			height: this.rows * this.#sizeR + this.#offsetY,
			fill: 'gray',
			opacity: 0.75,
			cornerRadius: 20,
		}))
		this.#X = new Konva.Image({
			x: width - 40,
			y: 15,
			image: X,
			scale: {x:0.3,y:0.3},
		})
		this.#box.add(this.#X)
		this.#X.on('click', UnitBox.#destroy)
		this.#box.add(new Konva.Text({
			x: 25,
			y: 15,
			fontSize: 22,
			fill: 'white',
			text: this.text
		}))
		board.add(this.#box)
	}
	destroy() {
		// Clear the singleton reference
		theUnitBox = null
		// Hide the group object
		this.#box.hide()
		// remove all remaining unit images from the group
		for (const u of this.#units) {
			u.img.remove()
		}
		this.#units.clear()	  // (prevent memory leak)
		// then destroy the group (and all remaining childs)
		this.#box.destroy()
	}
	// This is a 'click' event callback
	static #destroy(e) {
		theUnitBox.destroy()
	}
	static #dragstart(e) {
		theUnitBox.#place(e)
	}
	#place(e) {
		e.target.moveTo(this.board)
		e.target.moveToTop()
		e.target.on('dragend', unitSnapToHex)
		// replace myself! NOTE: you *must* 'off' the old callback!!
		e.target.off('dragstart')
		e.target.on('dragstart', moveToTop)
		let u = unit.fromImage(e.target)
		this.#units.delete(u)
	}
	addUnit(u, col, row) {
		if (u.hex) {
			let str = unit.toStr(u)
			return
		}
		if (this.#units.has(u)) return // already added
		this.#units.add(u)
		u.img.on('dragstart', UnitBox.#dragstart)
		let x = col * this.#sizeC + this.#offsetX
		let y = row * this.#sizeR + this.#offsetY
		u.img.x(x)
		u.img.y(y)
		this.#box.add(u.img)
	}
}

// Shows all "allowable" units for all major powers + neutrals (optional)
// Intended for initial deployment and later buys
export class UnitBoxMajor extends UnitBox {
	constructor(obj) {
		// ge,it,uk,su,fr,us,nu*
		obj.rows = 6
		if (obj.neutrals) obj.rows = 7
		// inf,inf,inf,pz,pz,pz,res,par,air,air,nav,mec
		obj.cols = 12
		super(obj)

		for (const u of unit.units) {
			if (u.allowable) {
				let rc = UnitBoxMajor.getRowCol(u)
				super.addUnit(u, rc.col, rc.row)
			}
			if (obj.neutrals) {
				if (u.nat == 'nu' && u.type != 'bh') {
					let rc = UnitBoxMajor.getRowCol(u)
					super.addUnit(u, rc.col, rc.row)
				}
			}
		}
	}
	static #layout = {
		ge: {
			row: 0,
			col: [
				{type: 'inf', s:3},
				{type: 'pz', s:4},
				{type: 'res'},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
				{type: 'pz'},
				{type: 'inf'},
				{type: 'mec'},
			]
		},
		it: {
			row: 1,
			col: [
				{type: 'inf', s:3},
				{type: 'inf', s:2},
				{type: 'inf'},
				{type: 'pz'},
				{type: 'res'},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
			]
		},
		uk: {
			row: 2,
			col: [
				{type: 'inf', s:3},
				{type: 'inf', s:1},
				{type: 'inf'},
				{type: 'pz', s:4},
				{type: 'pz'},
				{type: 'res'},
				{type: 'air', s:5},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
				{type: 'mec'},
			]
		},
		su: {
			row: 3,
			col: [
				{type: 'inf', s:3},
				{type: 'inf', s:1},
				{type: 'inf'},
				{type: 'pz', s:4, m:5},
				{type: 'pz',s:3},
				{type: 'res'},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
				{type: 'mec'},
				{type: 'pz'},
			]
		},
		fr: {
			row: 4,
			col: [
				{type: 'inf', s:2},
				{type: 'inf'},
				{type: 'pz'},
				{type: 'res'},
				{type: 'par'},
				{type: 'air'},
				{type: 'nav'},
			]
		},
		us: {
			row: 5,
			col: [
				{type: 'inf'},
				{type: 'pz'},
				{type: 'res'},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
			]
		},
		nu: {
			row: 6,
			col: [
				{type: 'inf', s:2},
				{type: 'inf'},
				{type: 'air'},
			]
		},
	}
	// (to make this static allows unit-test)
	static getRowCol(u) {
		let l = UnitBoxMajor.#layout[u.nat]
		let col
		for (col = 0; col < l.col.length; col++) {
			let t = l.col[col]
			if (u.type != t.type) continue
			if (!t.s) break
			if (u.s != t.s) continue
			if (!t.m) break
			if (u.m != t.m) continue
			break
		}
		return {col:col, row:l.row}
	}
}


export class UnitBoxNeutrals extends UnitBox {
	constructor(obj) {
		// nu+iq+bh, sp+tu, fin+bulg, rum+hun
		obj.rows = 4
		// sp+tu: inf,pz,air,nav,(blank),inf,pz,air,nav
		obj.cols = 9
		obj.text = "Neutrals and Minor Allies"
		super(obj)

		for (const u of unit.units) {
			if (!Object.keys(UnitBoxNeutrals.#layout).includes(u.nat)) continue
			if (u.hex) continue
			let rc = UnitBoxNeutrals.getRowCol(u)
			super.addUnit(u, rc.col, rc.row)
		}
	}
	static #layout = {
		nu: {
			row: 0,
			col: [
				{type: 'inf', s:2, col: 0},
				{type: 'inf', col: 1},
				{type: 'air', col: 2},
				{type: 'nav', col: 3},
				{type: 'bh', col: 8},
			]
		},
		iq: {
			row: 0,
			col: [
				{type: 'inf', col: 7},
			]
		},
		sp: {
			row: 1,
			col: [
				{type: 'inf', col: 0},
				{type: 'pz', col: 1},
				{type: 'air', col: 2},
				{type: 'nav', col: 3},
			]
		},
		tu: {
			row: 1,
			col: [
				{type: 'inf', col: 5},
				{type: 'pz', col: 6},
				{type: 'air', col: 7},
				{type: 'nav', col: 8},
			]
		},
		fi: {
			row: 2,
			col: [
				{type: 'inf', col: 0},
				{type: 'air', col: 1},
			]
		},
		bu: {
			row: 2,
			col: [
				{type: 'inf', col: 5},
				{type: 'air', col: 6},
			]
		},
		ru: {
			row: 3,
			col: [
				{type: 'inf', s:2, col: 0},
				{type: 'inf', col: 1},
				{type: 'air', col: 2},
			]
		},
		hu: {
			row: 3,
			col: [
				{type: 'inf', s:2, col: 5},
				{type: 'inf', col: 6},
				{type: 'air', col: 7},
			]
		},
	}
	// (to make this static allows unit-test)
	static getRowCol(u) {
		let l = UnitBoxNeutrals.#layout[u.nat]
		let t
		for (t of l.col) {
			if (u.type != t.type) continue
			if (!t.s) break
			if (u.s != t.s) continue
			break
		}
		return {col:t.col, row:l.row}
	}
}

// Shows all undployed air units for all major powers + air-bases
// Intended for break/buildup of 5-4 airs
export class UnitBoxAir extends UnitBox {
	constructor(obj) {
		// ge,it,uk,su,fr,us,nu*
		obj.rows = 6
		// 5-4, 3-4, 2-4, 1-4, ab
		obj.cols = 5
		obj.text = "Air Exchange"
		super(obj)

		for (const u of unit.units) {
			if (!Object.keys(UnitBoxAir.#layout).includes(u.nat)) continue
			if (u.hex) continue
			if (u.type != "air" && u.type != "ab") continue
			if (u.s == 5 && !u.allowable) continue
			let rc = UnitBoxAir.getRowCol(u)
			super.addUnit(u, rc.col, rc.row)
		}
	}
	static #layout = {
		ge: { row: 0 },
		it: { row: 1 },
		uk: { row: 2 },
		su: { row: 3 },
		fr: { row: 4 },
		us: { row: 5 }
	}
	// (to make this static allows unit-test)
	static getRowCol(u) {
		let l = UnitBoxAir.#layout[u.nat]
		let col
		const colLayout = [
			{type: 'air', s:5},
			{type: 'air', s:3},
			{type: 'air', s:2},
			{type: 'air', s:1},
			{type: 'ab'},
		]
		for (col = 0; col < colLayout.length; col++) {
			let t = colLayout[col]
			if (u.type != t.type) continue
			if (!t.s) break
			if (u.s != t.s) continue
			break
		}
		return {col:col, row:l.row}
	}
}
// Shows all undployed naval units for all major powers
// Intended for break/buildup of 9-boats
export class UnitBoxNav extends UnitBox {
	constructor(obj) {
		// ge,it,uk,su,fr,us
		obj.rows = 6
		// 9,8,6,4,2,1
		obj.cols = 6
		obj.text = "Naval Exchange"
		super(obj)

		for (const u of unit.units) {
			if (!Object.keys(UnitBoxNav.#layout).includes(u.nat)) continue
			if (u.hex) continue
			if (u.type != "nav") continue
			if (u.s == 9 && !u.allowable) continue
			let rc = UnitBoxNav.getRowCol(u)
			super.addUnit(u, rc.col, rc.row)
		}
	}
	static #layout = {
		ge: { row: 0 },
		it: { row: 1 },
		uk: { row: 2 },
		su: { row: 3 },
		fr: { row: 4 },
		us: { row: 5 }
	}
	// (to make this static allows unit-test)
	static getRowCol(u) {
		let l = UnitBoxNav.#layout[u.nat]
		let col
		const colLayout = [
			{type: 'nav', s:9},
			{type: 'nav', s:8},
			{type: 'nav', s:6},
			{type: 'nav', s:4},
			{type: 'nav', s:2},
			{type: 'nav'},
		]
		for (col = 0; col < colLayout.length; col++) {
			let t = colLayout[col]
			if (u.type != t.type) continue
			if (!t.s) break
			if (u.s != t.s) continue
			break
		}
		return {col:col, row:l.row}
	}
}


// ----------------------------------------------------------------------
// Info Box
// A draggable box with information text

// Singelton for now
let theInfoBox

export class InfoBox {
	x = 200
	y = 200
	label = "Information"
	text = "Nope, nothing"
	board			// "this" is placed on this layer
	#box
	constructor(obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				this[prop] = obj[prop];
			}
		}
		if (theInfoBox) {
			alert("Multiple InfoBox'es NOT allowed")
			return
		}
		theInfoBox = this
		let text = new Konva.Text({
			x: 25,
			y: 45,
			fontSize: 18,
			fill: 'white',
			lineHeight: 1.2,
			text: this.text
		})
		let width = text.width() + 100
		let height = text.height() + 60
		// We want the pop-up box to be visible on screen even if the
		// board is dragged. So, compensate for the board position
		let pos = this.board.position()
		this.#box = new Konva.Group({
			x: this.x - pos.x,
			y: this.y - pos.y,
			draggable: true,
		})
		this.#box.on('dragstart', moveToTop)
		this.#box.add(new Konva.Rect({
			x: 0,
			y: 0,
			width: width,
			height: height,
			fill: 'black',
			stroke: 'gold',
			strokeWidth: 4,
			cornerRadius: 20,
		}))
		let close = new Konva.Image({
			x: width - 40,
			y: 15,
			image: X,
			scale: {x:0.3,y:0.3},
		})
		this.#box.add(close)
		close.on('click', InfoBox.#destroy)
		this.#box.add(new Konva.Text({
			x: 25,
			y: 15,
			fontSize: 22,
			fill: 'gold',
			text: this.label,
		}))
		this.#box.add(text)
		board.add(this.#box)
	}
	destroy() {
		// Clear the singleton reference
		theInfoBox = null
		// destroy the group (and all remaining childs)
		// It is assumed that all eventHandlers are deleted too
		this.#box.destroy()
	}
	// This is a 'click' event callback
	static #destroy(e) {
		theInfoBox.destroy()
	}
}
