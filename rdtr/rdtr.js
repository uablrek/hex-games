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
	stage.container().addEventListener("keydown", (e) => {
		if (e.key == "Shift") shift = true
	})
	stage.container().addEventListener("keyup", (e) => {
		if (e.key == "Shift") shift = false
	})
}

var selected = null

// Set moveToTop as dragstart by default
export function moveToTop(e) {
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
	// hex *may* select an adjacent hex. But for practical use, it
	// is good enough for me.

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

  The first file to load should be a "scenario". It shows an empty map
  and an initialDeployment UnitBox.

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
export const version = 2
var game;


// This should only be called if no save exist
export function loadScenario(gameObject) {
	game = gameObject
	if (game.version != 2) {
		alert(`Unsupported version ${game.version}`)
		return
	}
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

	let unitBox = new UnitBoxMajor({
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
	console.log(game)
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
		this.#box = new Konva.Group({
			x: this.x,
			y: this.y,
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

// Shows all "allowable" units for all major powers + neutrals
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
