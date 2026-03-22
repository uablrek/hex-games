// SPDX-License-Identifier: CC0-1.0.
/*
  This is the unit library module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
 */
import * as map from './rdtr-map.js';
import {unit, box, grid} from '@uablrek/hex-games'
import {scrollBoard} from './rdtr-ui.js'

// Other files import this file as "unit", so re-export some functions
export const fromImage = unit.fromImg
export const toStr = unit.toStr
export const unselectAll = unit.unselectAll
export const fromStr = unit.fromStr
export const place = unit.place
export const moveTo = unit.moveTo
export const regretMove = unit.regretMove
export const rotateStack = unit.rotateStack
export const snapToHex = unit.unitDragend

let layer						  // The layer where units are placed
export async function init(_layer) {
	layer = _layer
	// Define .stat from .s and .m
	for (const u of units) {
		if ('s' in u) {
			if (u.m)
				u.stat = `${u.s}-${u.m}`
			else
				u.stat = `${u.s}`
		}
	}
	unit.addUnitGenerator('nav', unit.ugenNav)
    unit.addUnitGenerator('ab', unit.ugenAb)
	unit.addUnitGenerator('bh', ugenBh)
	await unit.init(units, nations, 0.88, false)
	for (const u of units) {
		u.img.draggable(true)
		u.img.on('dragstart', function(e) {
			e.target.moveToTop()
		})
		u.img.on('dragend', snapToHex)
	}
}
function ugenBh(conf, u, side) {
	u.add(new Konva.Circle({
		stroke: conf.stroke,
		radius: side*0.33,
		strokeWidth: 3,
		x: side/2,
		y: side/2,
	}))
	u.add(new Konva.Text({
		fill: conf.stroke,
		text: "BH",
		fontStyle: 'bold',
		fontFamily: 'sans-serif',
		fontSize: side/3,
		x: side*0.26,
		y: side*0.32,
	}))
	return true
}

// ----------------------------------------------------------------------
// UnitBox'es

export const unitBoxConf = {
	nu: {
		hex: {x:13,y:8},
		conf: {
			text: "Neutrals",
			unitTypes: [
				{type:'inf', stat: "2-3"},
				{type:'inf', stat: "1-3"},
				{type:'air', stat: "1-4"},
				{type:'air', stat: "2-4"},
				{type:'nav', stat: "2"},
			],
			destroyable: false,
		},
	},
	it: {
		hex: {x:22,y:31},
		conf: {
 			text: "Italy",
			unitTypes: [
				{type:'inf', stat: "3-3"},
				{type:'inf', stat: "2-3"},
				{type:'inf', stat: "1-3"},
				{type:'pz',  stat: "2-5"},
				{type:'par', stat: "2-3"},
				{type:'res', stat: "1"},
				{type:'air', stat: "5-4"},
				{type:'nav', stat: "9"},
				{type:'ab'},
			],
			destroyable: false,
		},
	},
	fr: {
		hex: {x:8,y:9},
		conf: {
			text: "France",
			unitTypes: [
				{type:'inf', stat: "2-3"},
				{type:'pz',  stat: "3-5"},
				{type:'air', stat: "5-4"},
				{type:'res', stat: "1"},
				{type:'nav', stat: "9"},
				{type:'ab'},
			],
			destroyable: false,
		},
	},
	uk: {
		hex: {x:15,y:7},
		conf: {
			text: "Britain",
			unitTypes: [
				{type:'inf', stat: "3-4"},
				{type:'inf', stat: "1-3"},
				{type:'pz',  stat: "4-5"},
				{type:'pz',  stat: "2-5"},
				{type:'par', stat: "3-3"},
				{type:'res', stat: "1"},
				{type:'air', stat: "5-4"},
				{type:'air', stat: "1-4"},
				{type:'nav', stat: "9"},
				{type:'ab'},
			],
			destroyable: false,
		},
	},
	su: {
		hex: {x:37,y:5},
		conf: {
			text: "U.S.S.R",
			unitTypes: [
				{type:'inf', stat: "1-3"},
				{type:'inf', stat: "2-3"},
				{type:'inf', stat: "3-3"},
				{type:'pz',  stat: "3-5"},
				{type:'pz',  stat: "4-5"},
				{type:'par', stat: "2-3"},
				{type:'air', stat: "5-4"},
				{type:'nav', stat: "9"},
				{type:'ab'},
			],
			destroyable: false,
		},
	},
	ge: {
		hex: {x:22,y:6},
		conf: {
			text: "Germany",
			unitTypes: [
				{type:'inf', stat: "3-3"},
				{type:'inf', stat: "1-3"},
				{type:'pz',  stat: "4-6"},
				{type:'pz',  stat: "5-6"},
				{type:'res', stat: "1"},
				{type:'par', stat: "3-3"},
				{type:'air', stat: "5-4"},
				{type:'nav', stat: "9"},
				{type:'ab'},
			],
			destroyable: false,
		},
	},
	us: {
		hex: {x:5,y:7},
		conf: {
			text: "United States",
			unitTypes: [
				{type:'inf', stat: "3-4"},
				{type:'pz',  stat: "5-6"},
				{type:'par', stat: "3-3"},
				{type:'res', stat: "1"},
				{type:'air', stat: "5-4"},
				{type:'nav', stat: "9"},
				{type:'ab'},
			],
			destroyable: false,
		},
	},
}
export function mkUnitbox(nat) {
	const unitbox = new unit.UnitBox(unitBoxConf[nat].conf)
	for (const u of units) {
		if (u.nat != nat) continue
		if (!u.allowable) continue
		if (u.hex) continue
		unitbox.addUnit(u)
	}
	const hex = unitBoxConf[nat].hex
	unitbox.box.position(grid.hexToPixel(hex))
	layer.add(unitbox.box)

	// We want the unitbox to be visible, so the board is scrolled.
	// X should be around the middle of the window
	// Y should be around 20% from the top
	let boardHex = {x:0, y:0}
	boardHex.x = hex.x - map.visibleArea.width * 0.4
	boardHex.y = hex.y - map.visibleArea.height * 0.2
	if (boardHex.x + map.visibleArea.width >= map.mapSize.width)
		boardHex.x = map.mapSize.width - map.visibleArea.width
	if (boardHex.y + map.visibleArea.height >= map.mapSize.height)
		boardHex.y = map.mapSize.height - map.visibleArea.height
	scrollBoard(boardHex)
	return unitbox
}

// ----------------------------------------------------------------------
// Unit Box
// A draggable shaded box with units (prototype in "deployment-demo.js")
// TODO: move UnitBox to "units.js"?

// Singelton for now
let theUnitBox

// Re-define to avoid cyclic dependency to rdtr.js
function moveToTop(e) {
	e.target.moveToTop()
}

export class UnitBox {
	rows = 1
	cols = 4
	x = 400
	y = 100
	text = "Units"
	box
	#sizeC = 60
	#sizeR = 70
	#offsetX = 50
	#offsetY = 80
	#units = new Set()
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
		let pos = layer.position()
		this.box = new Konva.Group({
			x: this.x - pos.x,
			y: this.y - pos.y,
			draggable: true,
		})
		this.box.on('dragstart', moveToTop)
		let width = this.cols * this.#sizeC + this.#offsetX
		this.box.add(new Konva.Rect({
			x: 0,
			y: 0,
			width: width,
			height: this.rows * this.#sizeR + this.#offsetY,
			fill: 'gray',
			opacity: 0.75,
			cornerRadius: 20,
		}))
		let close = box.X.clone({
			x: width - 40,
			y: 15,
			scale: {x:0.3,y:0.3},
		})
		box.setStrokeX(close, 'white')
		this.box.add(close)
		close.on('click', UnitBox.#destroy)
		this.box.add(new Konva.Text({
			x: 25,
			y: 15,
			fontSize: 22,
			fill: 'white',
			text: this.text
		}))
		layer.add(this.box)
	}
	destroy() {
		// Clear the singleton reference
		theUnitBox = null
		// Hide the group object
		this.box.hide()
		// remove all remaining unit images from the group
		for (const u of this.#units) {
			u.img.remove()
		}
		this.#units.clear()	  // (prevent memory leak)
		// then destroy the group (and all remaining childs)
		// It is assumed that all eventHandlers are deleted too
		this.box.destroy()
	}
	// This is a 'click' event callback
	static #destroy(e) {
		theUnitBox.destroy()
	}
	static #dragstart(e) {
		theUnitBox.place(e)
	}
	place(e) {
		e.target.moveTo(layer)
		e.target.moveToTop()
		e.target.on('dragend', snapToHex)
		// replace myself! NOTE: you *must* 'off' the old callback!!
		e.target.off('dragstart')
		e.target.on('dragstart', moveToTop)
		let u = fromImage(e.target)
		this.#units.delete(u)
	}
	addUnit(u, col, row) {
		if (u.hex) {
			let str = toStr(u)
			return
		}
		if (this.#units.has(u)) return // already added
		this.#units.add(u)
		u.img.on('dragstart', UnitBox.#dragstart)
		let x = col * this.#sizeC + this.#offsetX
		let y = row * this.#sizeR + this.#offsetY
		u.img.x(x)
		u.img.y(y)
		this.box.add(u.img)
	}
}


// Shows all undployed air units for all major powers + air-bases
// Intended for break/buildup of 5-4 airs
export class UnitBoxAir extends UnitBox {
	constructor() {
		super({
			// ge,it,uk,su,fr,us,nu*
			rows: 6,
			// 5-4, 3-4, 2-4, 1-4, ab
			cols: 5,
			text: "Air Exchange",
		})

		for (const u of units) {
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
		super({
			// ge,it,uk,su,fr,us
			rows: 6,
			// 9,8,6,4,2,1
			cols: 6,
			text: "Fleet Exchange"
		})

		for (const u of units) {
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
// An array of all units.
// { type:"inf", nat: "fr", m:2, s:3, lbl:"8",
//   stat:"3-3", img:Image, hex:{x:,y:}}  // and more, added later
export const units = [
	{type:"inf", nat: "fr", m:3, s:2, lbl:"Alp"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"Col"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"6"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"7"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"8"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"10"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"11"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"13"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"17"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"16"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"18"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"24"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"25"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"42"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"44"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"45"},
	{type:"pz",  nat: "fr", m:5, s:3, lbl:"1"},
	{type:"pz",  nat: "fr", m:5, s:3, lbl:"2GCM"},
	{type:"pz",  nat: "fr", m:5, s:3, lbl:"5GCM"},
	{type:"air", nat: "fr", m:4, s:5},
	{type:"air", nat: "fr", m:4, s:5},
	{type:"air", nat: "fr", m:4, s:5},
	{type:"air", nat: "fr", s:3, m:4},
	{type:"air", nat: "fr", s:3, m:4},
	{type:"air", nat: "fr", s:2, m:4},
	{type:"air", nat: "fr", s:1, m:4},
	{type:"air", nat: "fr", s:1, m:4},
	{type:"ab", nat: "fr"},
	{type:"ab", nat: "fr"},
	{type:"ab", nat: "fr"},
	{type:"res", nat: "fr", s:1},
	{type:"res", nat: "fr", s:1},
	{type:"res", nat: "fr", s:1},
	{type:"res", nat: "fr", s:1},
	{type:"nav", nat: "fr", s:9},
	{type:"nav", nat: "fr", s:9},
	{type:"nav", nat: "fr", s:9},
	{type:"nav", nat: "fr", s:8},
	{type:"nav", nat: "fr", s:8},
	{type:"nav", nat: "fr", s:6},
	{type:"nav", nat: "fr", s:6},
	{type:"nav", nat: "fr", s:4},
	{type:"nav", nat: "fr", s:4},
	{type:"nav", nat: "fr", s:2},
	{type:"nav", nat: "fr", s:2},
	{type:"nav", nat: "fr", s:1},
	{type:"nav", nat: "fr", s:1},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"1 Alg"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"2 Alg"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"3 Alg"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"1 Mor"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"2 Mor"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"1 Tun"},
	{type:"pz", nat:"fr", s:3, m:5, lbl:"1 GCM"},
	{type:"pz", nat:"fr", s:3, m:5, lbl:"3 GCM"},
	{type:"pz", nat:"fr", s:3, m:5, lbl:"4 GCM"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"2"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"3"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"4"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"5"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"6"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"8"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"10"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"12"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"19"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"21"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"22"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"23"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"25b"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"26b"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"27b"},
	{type:"par", nat: "us", s:3, m:3, lbl:"18AB"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"1"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"7"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"13"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"16"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"20"},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:3, m:4},
	{type:"air", nat: "us", s:3, m:4},
	{type:"air", nat: "us", s:2, m:4},
	{type:"air", nat: "us", s:2, m:4},
	{type:"air", nat: "us", s:1, m:4},
	{type:"air", nat: "us", s:1, m:4},
	{type:"air", nat: "us", s:1, m:4},
	{type:"ab", nat: "us"},
	{type:"ab", nat: "us"},
	{type:"ab", nat: "us"},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:8},
	{type:"nav", nat: "us", s:8},
	{type:"nav", nat: "us", s:6},
	{type:"nav", nat: "us", s:6},
	{type:"nav", nat: "us", s:4},
	{type:"nav", nat: "us", s:4},
	{type:"nav", nat: "us", s:2},
	{type:"nav", nat: "us", s:2},
	{type:"nav", nat: "us", s:1},
	{type:"nav", nat: "us", s:1},
	{type:"inf", nat: "su", s:3, m:3, lbl:"2 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"3 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"5 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"6 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"7 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"8 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"11 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"1 Shk"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"2 Shk"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"3 Shk"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"5 Shk"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"Nav"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"53"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"57"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"60"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"61"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"62"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"63"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"64"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"70"},
	{type:"par", nat: "su", s:2, m:3, lbl:"1 Pr"},
	{type:"par", nat: "su", s:2, m:3, lbl:"2 Pr"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"3"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"4"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"5"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"6"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"7"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"8"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"9"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"10"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"11"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"12"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"13"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"14"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"16"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"18"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"19"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"20"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"21"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"22"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"23"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"24"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"26"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"27"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"28"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"29"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"30"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"3 Me"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"11 Tk"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"13 Me"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"15 Me"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"19 Me"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"22 Me"},
	{type:"pz", nat: "su", s:4, m:5, lbl:"1 Tk"},
	{type:"pz", nat: "su", s:4, m:5, lbl:"2 Tk"},
	{type:"pz", nat: "su", s:4, m:5, lbl:"3 Tk"},
	{type:"pz", nat: "su", s:4, m:5, lbl:"5 Tk"},
	{type:"air", nat: "su", s:5, m:4},
	{type:"air", nat: "su", s:5, m:4},
	{type:"air", nat: "su", s:5, m:4},
	{type:"air", nat: "su", s:3, m:4},
	{type:"air", nat: "su", s:3, m:4},
	{type:"air", nat: "su", s:2, m:4},
	{type:"air", nat: "su", s:2, m:4},
	{type:"air", nat: "su", s:1, m:4},
	{type:"air", nat: "su", s:1, m:4},
	{type:"ab", nat: "su"},
	{type:"ab", nat: "su"},
	{type:"ab", nat: "su"},
	{type:"nav", nat: "su", s:9},
	{type:"nav", nat: "su", s:9},
	{type:"nav", nat: "su", s:9},
	{type:"nav", nat: "su", s:8},
	{type:"nav", nat: "su", s:8},
	{type:"nav", nat: "su", s:6},
	{type:"nav", nat: "su", s:6},
	{type:"nav", nat: "su", s:4},
	{type:"nav", nat: "su", s:2},
	{type:"nav", nat: "su", s:2},
	{type:"nav", nat: "su", s:1},
	{type:"nav", nat: "su", s:1},
	{type:"mec", nat: "su", s:2, m:5, lbl:"3"},
	{type:"mec", nat: "su", s:2, m:5, lbl:"4"},
	{type:"mec", nat: "su", s:2, m:5, lbl:"5"},
	{type:"mec", nat: "su", s:2, m:5, lbl:"6"},
	{type:"mec", nat: "su", s:2, m:5, lbl:"7"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"13"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"14"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"16"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"18"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"19"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"20"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"21"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"22"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"23"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"24"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"26"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"27"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"28"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"29"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"30"},
	{type:"pz", nat: "su", s:4, m:6, lbl:"1 Tk"},
	{type:"pz", nat: "su", s:4, m:6, lbl:"2 Tk"},
	{type:"pz", nat: "su", s:4, m:6, lbl:"3 Tk"},
	{type:"pz", nat: "su", s:4, m:6, lbl:"5 Tk"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"1"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"2"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"3"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"4"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"5"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"6"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"7"},	
	{type:"pz", nat:"tu", s:2, m:5, lbl:"1"},
	{type:"pz", nat:"tu", s:2, m:5, lbl:"2"},
	{type:"air", nat:"tu", s:2, m:4, lbl:"Turk"},
	{type:"air", nat:"tu", s:2, m:4, lbl:"Turk"},
	{type:"nav", nat:"tu", s:2},
	{type:"nav", nat:"tu", s:2},
	{type:"nav", nat:"tu", s:2},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Galicia"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Castilla"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Aragon"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Navarr"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Granad"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Cordob"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Andalu"},
	{type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{type:"nav", nat:"sp", s:2},
	{type:"nav", nat:"sp", s:2},
	{type:"nav", nat:"sp", s:2},
	{type:"nav", nat:"sp", s:2},
	{type:"pz", nat:"sp", s:2, m:5, lbl:"Madrid"},
	{type:"inf", nat:"nu", s:1, m:3}, // 13 x 1-3
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:2, m:3}, // 14 x 2-3
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"air", nat:"nu", s:1, m:4}, // 7 x 1-4
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"nav", nat:"nu", s:2},
	{type:"nav", nat:"nu", s:2},
	{type:"bh", nat:"al", color:'white', stroke:'black'},
	{type:"bh", nat:"al", color:'white', stroke:'black'},
	{type:"bh", nat:"al", color:'white', stroke:'black'},
	{type:"bh", nat:"al", color:'white', stroke:'black'},
	{type:"bh", nat:"al", color:'white', stroke:'black'},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"1 Iraq"},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"2 Iraq"},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"3 Iraq"},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"4 Iraq"},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"5 Iraq"},
	{type:"air", nat:"iq", s:2, m:4, lbl:"5 Iraq"},
	{type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{type:"air", nat:"bu", s:1, m:4, lbl:"Bulg"},
	{type:"inf", nat:"ru", s:2, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:2, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"air", nat:"ru", s:1, m:4, lbl:"Rum"},
	{type:"inf", nat:"hu", s:2, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"air", nat:"hu", s:1, m:4, lbl:"Hun"},
	{type:"air", nat:"fi", s:1, m:4, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"5"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"8"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"10"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"12"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"11"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"CN"},
	{type:"inf", nat:"it", s:3, m:3, lbl:"Celere"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"Libya"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"14"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"16"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"17"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"20"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"35"},
	{type:"inf", nat:"it", s:3, m:3, lbl:"Alpini"},
	{type:"par", nat:"it", s:2, m:3, lbl:"Fologre"},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"pz", nat:"it", s:2, m:5, lbl:"1"},
	{type:"pz", nat:"it", s:2, m:5, lbl:"2"},
	{type:"pz", nat:"it", s:2, m:5, lbl:"21"},
	{type:"pz", nat:"it", s:2, m:5, lbl:"Celere"},
	{type:"air", nat:"it", s:5, m:4},
	{type:"air", nat:"it", s:5, m:4},
	{type:"air", nat:"it", s:5, m:4},
	{type:"air", nat:"it", s:3, m:4},
	{type:"air", nat:"it", s:3, m:4},
	{type:"air", nat:"it", s:2, m:4},
	{type:"air", nat:"it", s:2, m:4},
	{type:"air", nat:"it", s:1, m:4},
	{type:"ab", nat:"it"},
	{type:"ab", nat:"it"},
	{type:"ab", nat:"it"},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:8},
	{type:"nav", nat:"it", s:8},
	{type:"nav", nat:"it", s:6},
	{type:"nav", nat:"it", s:6},
	{type:"nav", nat:"it", s:4},
	{type:"nav", nat:"it", s:4},
	{type:"nav", nat:"it", s:2},
	{type:"nav", nat:"it", s:2},
	{type:"nav", nat:"it", s:1},
	{type:"nav", nat:"it", s:1},
	{type:"pz", nat:"it", s:2, m:5, lbl:"Maletti"},
	{type:"inf", nat:"it", s:3, m:3, lbl:"Centauro"},
	{type:"inf", nat:"it", s:3, m:3, lbl:"Freccia"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"1 BEF"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"2 BEF"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"5"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"8"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"9"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"12"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"2 Can"},
	{type:"inf", nat:"uk", s:1, m:3, lbl:"Egypt"},
	{type:"inf", nat:"uk", s:1, m:3, lbl:"Palest"},
	{type:"inf", nat:"uk", s:1, m:3, lbl:"Malta"},
	{type:"pz", nat:"uk", s:4, m:5, lbl:"13"},
	{type:"pz", nat:"uk", s:4, m:5, lbl:"30"},
	{type:"pz", nat:"uk", s:4, m:5, lbl:"1 Can"},
	{type:"pz", nat:"uk", s:4, m:5, lbl:"Polish"},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"par", nat:"uk", s:3, m:3, lbl:"1 AB"},
	{type:"pz", nat:"uk", s:2, m:5, lbl:"WDF"},
	{type:"air", nat:"uk", s:5, m:4},
	{type:"air", nat:"uk", s:5, m:4},
	{type:"air", nat:"uk", s:5, m:4},
	{type:"air", nat:"uk", s:5, m:4},
	{type:"air", nat:"uk", s:3, m:4},
	{type:"air", nat:"uk", s:3, m:4},
	{type:"air", nat:"uk", s:3, m:4},
	{type:"air", nat:"uk", s:2, m:4},
	{type:"air", nat:"uk", s:2, m:4},
	{type:"air", nat:"uk", s:2, m:4},
	{type:"air", nat:"uk", s:1, m:4},
	{type:"air", nat:"uk", s:1, m:4},
	{type:"air", nat:"uk", s:1, m:4},
	{type:"air", nat:"uk", s:1, m:4},
	{type:"ab", nat:"uk"},
	{type:"ab", nat:"uk"},
	{type:"ab", nat:"uk"},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:8},
	{type:"nav", nat:"uk", s:8},
	{type:"nav", nat:"uk", s:8},
	{type:"nav", nat:"uk", s:8},
	{type:"nav", nat:"uk", s:6},
	{type:"nav", nat:"uk", s:6},
	{type:"nav", nat:"uk", s:6},
	{type:"nav", nat:"uk", s:4},
	{type:"nav", nat:"uk", s:4},
	{type:"nav", nat:"uk", s:4},
	{type:"nav", nat:"uk", s:2},
	{type:"nav", nat:"uk", s:2},
	{type:"nav", nat:"uk", s:2},
	{type:"nav", nat:"uk", s:1},
	{type:"nav", nat:"uk", s:1},
	{type:"nav", nat:"uk", s:1},
	{type:"nav", nat:"uk", s:1},
	{type:"esc", nat:"uk", s:1},
	{type:"esc", nat:"uk", s:2},
	{type:"esc", nat:"uk", s:3},
	{type:"esc", nat:"uk", s:4},
	{type:"esc", nat:"uk", s:5},
	{type:"esc", nat:"uk", s:6},
	{type:"esc", nat:"uk", s:7},
	{type:"esc", nat:"uk", s:8},
	{type:"esc", nat:"uk", s:9},
	{type:"esc", nat:"uk", s:10},
	{type:"esc", nat:"uk", s:20},
	{type:"bmb", nat:"uk", s:1},
	{type:"bmb", nat:"uk", s:2},
	{type:"bmb", nat:"uk", s:3},
	{type:"bmb", nat:"uk", s:4},
	{type:"bmb", nat:"uk", s:5},
	{type:"bmb", nat:"uk", s:6},
	{type:"bmb", nat:"uk", s:7},
	{type:"bmb", nat:"uk", s:8},
	{type:"bmb", nat:"uk", s:9},
	{type:"bmb", nat:"uk", s:10},
	{type:"bmb", nat:"uk", s:20},
	{type:"mec", nat:"uk", s:2, m:5, lbl:"Egypt"},
	{type:"mec", nat:"uk", s:2, m:5, lbl:"Palest"},
	{type:"mec", nat:"uk", s:2, m:5, lbl:"Malta"},
	{type:"inf", nat:"uk", s:2, m:3, lbl:"Egypt"},
	{type:"inf", nat:"uk", s:2, m:3, lbl:"Palest"},
	{type:"inf", nat:"uk", s:2, m:3, lbl:"Malta"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"1"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"2"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"3"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"4"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"6"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"7"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"8"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"9"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"10"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"5 SS"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"13 SS"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"15"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"18"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"20"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"23"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"25"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"27"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"30"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"36"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"39"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"40"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"44"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"51"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"67"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"74"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"76"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"84"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"11"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"17"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"29"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"2 Fsjr"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"49"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"50"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"56"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"66"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"79"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"81"},
	{type:"par", nat:"ge", s:3, m:3, lbl:"1 Fsjr"},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"pz", nat:"ge", s:5, m:6, lbl:"1 SS"},
	{type:"pz", nat:"ge", s:5, m:6, lbl:"GDS"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"57"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"2 SS"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"14"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"19"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"24"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"41"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"46"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"47"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"48"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"56"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"39"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"DAK"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"9"},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:3, m:4},
	{type:"air", nat:"ge", s:3, m:4},
	{type:"air", nat:"ge", s:3, m:4},
	{type:"air", nat:"ge", s:3, m:4},
	{type:"air", nat:"ge", s:2, m:4},
	{type:"air", nat:"ge", s:2, m:4},
	{type:"air", nat:"ge", s:2, m:4},
	{type:"air", nat:"ge", s:1, m:4},
	{type:"air", nat:"ge", s:1, m:4},
	{type:"air", nat:"ge", s:1, m:4},
	{type:"air", nat:"ge", s:1, m:4},
	{type:"ab", nat:"ge"},
	{type:"ab", nat:"ge"},
	{type:"ab", nat:"ge"},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:8},
	{type:"nav", nat:"ge", s:6},
	{type:"nav", nat:"ge", s:6},
	{type:"nav", nat:"ge", s:4},
	{type:"nav", nat:"ge", s:4},
	{type:"nav", nat:"ge", s:2},
	{type:"nav", nat:"ge", s:2},
	{type:"nav", nat:"ge", s:1},
	{type:"nav", nat:"ge", s:1},
	{type:"sub", nat:"ge", s:1},
	{type:"sub", nat:"ge", s:2},
	{type:"sub", nat:"ge", s:3},
	{type:"sub", nat:"ge", s:4},
	{type:"sub", nat:"ge", s:5},
	{type:"sub", nat:"ge", s:6},
	{type:"sub", nat:"ge", s:7},
	{type:"sub", nat:"ge", s:8},
	{type:"sub", nat:"ge", s:9},
	{type:"sub", nat:"ge", s:10},
	{type:"sub", nat:"ge", s:20},
	{type:"int", nat:"ge", s:1},
	{type:"int", nat:"ge", s:2},
	{type:"int", nat:"ge", s:3},
	{type:"int", nat:"ge", s:4},
	{type:"int", nat:"ge", s:5},
	{type:"int", nat:"ge", s:6},
	{type:"int", nat:"ge", s:7},
	{type:"int", nat:"ge", s:8},
	{type:"int", nat:"ge", s:9},
	{type:"int", nat:"ge", s:10},
	{type:"int", nat:"ge", s:20},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"49"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"50"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"56"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"66"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"79"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"81"},
	{type:"par", nat:"ge", s:3, m:3, lbl:"2 Fsjr"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"Sp SS"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"Tu SS"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"1 Fr SS"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"2 Fr SS"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"Croat SS"},
	{type:"bh", nat:"ge"},
	{type:"bh", nat:"ge"},
	{type:"bh", nat:"ge"},
]
const nations = {
	ge: {color:'black',stroke:'white'},
	uk: {color:'#FAD449',stroke:'black'},
	it: {color:'#C1C7B1',stroke:'black'},
	fr: {color:'#76BFCB',stroke:'black'},
	us: {color:'#9F8E29',stroke:'black'},
	su: {color:'#AE8C29',stroke:'black'},
	iq: {color:'#327844',stroke:'white'},
	sp: {color:'#AF8D54',stroke:'white'},
	tu: {color:'#D5C085',stroke:'white'},
	nu: {color:'#996E2B',stroke:'white'},
	fi: {color:'#CBCBCB',stroke:'black'},
	hu: {color:'#CBCBCB',stroke:'black'},
	ru: {color:'#CBCBCB',stroke:'black'},
	bu: {color:'#CBCBCB',stroke:'black'},
}
