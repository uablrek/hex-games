// SPDX-License-Identifier: CC0-1.0.
/*
  Units for turn-based games on hex grids.

  A unit object may have these fields:
  {nat:'', type:'', stat:'', sz:'', lab:'', color:'', stroke:''}

  All are optional. Color will be precedence over nat+scheme.
  The .hex field is the hex where a unit is placed.

  The img's are created as Korva.Group's, but may be converted to images
  to prevent frequent rendering.
 */
import Konva from 'konva'
import {grid, box, map} from './hex-games.js'
import * as images from './unit-images.js'

// Path for half circle
// Source - https://stackoverflow.com/a/18473154
// Posted by opsb, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-26, License - CC BY-SA 3.0
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0
	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	}
}
function describeArc(x, y, radius, startAngle, endAngle){
	var start = polarToCartesian(x, y, radius, endAngle)
	var end = polarToCartesian(x, y, radius, startAngle)
	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
	var d = [
		"M", start.x, start.y,
		"A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
	].join(" ")
	return d	
}

let scale = 1
let units = []
let nations = {}
const side = 55
const unitBase = new Konva.Rect({
	height: side,
	width: side,
	cornerRadius: side*0.12,
})
const rx = side * 0.2
const ry = side * 0.18
const rw = side * 0.55
const rh = side * 0.35
const tx = side * 0.48
const ty = side * 0.58
const tz = side * 0.38
const lx = side * 0.78
const ly = side * 0.4
const lz = side * 0.18
const szx = side * 0.5
const szy = side * 0.0
const szz = side * 0.18
const fontFamily = 'sans-serif'
// Set imageOffset if unit-shapes are converted to images
let imageOffset

const pathNav = 'm 570.04688,237.1875 -10.53907,1.4082 -7.37109,4.41797 1.93945,15.24414 -23,2.67774 -4.8125,11.34179 -5.05664,3.82227 -6.52539,18.60742 -10.47656,7.39453 -11.8457,20.74024 -11.69727,-1.03125 -2.82422,-10.99024 h -50.25195 l -1.05469,3.44727 -36.47461,-12.89258 -3.54883,10.04102 36.90821,13.04492 -1.9629,6.41992 -7.45117,21.47266 -13.26953,-26.0254 h -45.72851 l -9.26172,5.34766 -0.61328,2.29297 -37.84571,-13.37695 -3.54882,10.04101 38.6289,13.65235 -1.8418,6.875 -168.08007,-3.04883 -10.51953,-6.97266 -15.04493,-1.5 -3.05078,-5.96875 H 123.6875 v 15.06836 l 36.76953,32.66797 h 701.43164 l 5.79492,-5.79492 v -14.89258 l -2.70507,-0.0488 -6.60157,-11.14648 -21.37304,0.43945 -5.07422,10.10742 -39.43164,-0.71484 -5.0625,-12.14063 h -25.03321 l -9.84961,-13.875 h -20.56054 l -6.62696,-11.10742 -8.91406,2.38867 -3.73633,7.57227 -3.32031,0.0352 -9.15234,-5.60352 v -32.77148 h -13.84766 l -11.73047,43.77929 h -19.98437 l 3.27539,-12.22656 7.27148,-7.26953 -13.67578,-15.37695 -22.10351,8.10156 -21.35743,24.01562 -10.01172,-2.68359 v -25.29297 h -16.67773 l -13.17578,-7.68945 V 260.6114 l 4.90234,-10.625 6.68946,-5.97656 z'
const pathSq = `M0,1h${rw}v${rh}h${-rw}v${-rh-1}`
const pathX = `M0,1l${rw},${rh}M0,${rh}l${rw},${-rh+2}`
const pathPz = `M${rw*0.3},${rh*0.3}` +
	  describeArc(side*0.18, side/5, 5, 180, 360) +
	  describeArc(side*0.38, side/5, 5, 0, 180) +
	  `h${-side*0.2-1}m0,10h${side*0.2+2}`
const pathCav = `M0,${rh+1}L${rw},1`
const pathAirRaw = describeArc(side*0.14, side/5, 3, 175, 365) +
	  describeArc(side*0.40, side/5, 3, 0, 185) +
	  `l${-side*0.26}},6m0,-6l${side*0.26},6`
const pathAir = `M${rw*0.3},${rh*0.3}` + pathAirRaw
const paraPath = `M${rw*0.25},${rh*0.93}q${rw*0.18},${-rh*0.3},${rw*0.25},0` +
	  `q${rw*0.07},${-rh*0.3},${rw*0.25},0`
const unitTypePath = {
	inf: pathSq + pathX,
	pz: pathSq + pathPz,
	mec: pathSq + pathX + pathPz,
	cav: pathSq + pathCav,
	air: pathSq + pathAir,
	par: pathSq + pathX + paraPath,
}
const hussarImg = new Image()

// Returns a Konva.Group
function createUnit(obj = {}) {
	const conf = {
		color: 'olive',
		stroke: 'black',
		type: 'res',
		stat: '',
		sz: '',
		lbl: ''
	}
	for (var prop in obj) {
		if (prop in conf) conf[prop] = obj[prop]
	}
	if ('nat' in obj && obj.nat in nations) {
		if (!('color' in obj)) {
			conf.color = nations[obj.nat].color
			if ('stroke' in nations[obj.nat])
				conf.stroke = nations[obj.nat].stroke
		}
	}

	let u = new Konva.Group({
		offset: {x:side/2, y:side/2},
	})
	u.add(unitBase.clone({
		fill: conf.color,
		name: "base",
	}))
	let scl
	if (scale != 1) scl = {x:scale,y:scale}
	if (conf.type == "gen") {
		if (images.loaded) {
			u.add(new Konva.Image({
				x: side*0.2,
				y: side*0.05,
				image: hussarImg,
				scaleX: 0.045,
				scaleY: 0.045,
				//scale: {x:0.5,y:0.04}
			}))
		} else {
			u.add(new Konva.Path({
				data: pathSq,
				x: rx,
				y: ry,
				stroke: conf.stroke,
			}))
		}
 		let txt = new Konva.Text({
			text: conf.stat,
			x: tx,
			y: side*0.65,
			fontSize: side*0.25,
			fontStyle: 'bold',
			fontFamily: fontFamily,
			fill: conf.stroke,
		})
		txt.offsetX(txt.width()/2)
		u.add(txt)
		if (conf.lbl) {
 			let ltxt = new Konva.Text({
				text: conf.lbl,
				fontSize: lz,
				fontFamily: fontFamily,
				fill: conf.stroke,
			})
			ltxt.offsetX(ltxt.width()/2)
			ltxt.position({x:side*0.8,y:side*0.5})
			ltxt.rotate(-90)
			u.add(ltxt)
		}
		if (scl) u.scale(scl)
		return u
	}
	if (conf.type == "nav") {
		const nscale = 0.06
		u.add(new Konva.Path({
			x: -2,
			y: 0,
			data: pathNav,
			fill: conf.stroke,
			scale: {x:nscale,y:nscale}
		}))
 		let txt = new Konva.Text({
			text: conf.stat,
			x: tx,
			y: side*0.47,
			fontSize: tz,
			fontStyle: 'bold',
			fontFamily: fontFamily,
			fill: conf.stroke,
		})
		txt.offsetX(txt.width()/2)
		u.add(txt)
		if (scl) u.scale(scl)
		return u
	}
	if (conf.type == "ab") {
		u.add(new Konva.Circle({
			stroke: conf.stroke,
			radius: side*0.33,
			strokeWidth: 3,
			x: side/2,
			y: side/2,
		}))
		u.add(new Konva.Path({
			stroke: conf.stroke,
			data: pathAirRaw,
			x: side*0.23,
			y: side*0.3,
		}))
		if (scl) u.scale(scl)
		return u
	}
	let upath = pathSq
	if (conf.type in unitTypePath) upath = unitTypePath[conf.type]
	u.add(new Konva.Path({
		data: upath,
		x: rx,
		y: ry,
		stroke: conf.stroke,
	}))
	if (conf.type == 'art') {
		// Can't create a filled circle with an svg path
		u.add(new Konva.Circle({
			fill: conf.stroke,
			x: rx + rw/2,
			y: ry+1 + rh/2,
			radius: rh/4,
		}))
	}
 	let txt = new Konva.Text({
		text: conf.stat,
		x: tx,
		y: ty,
		fontSize: tz,
		fontStyle: 'bold',
		fontFamily: fontFamily,
		fill: conf.stroke,
	})
	txt.offsetX(txt.width()/2)
	u.add(txt)
	if (conf.sz) {
 		let stxt = new Konva.Text({
			text: conf.sz,
			fontSize: szz,
			fontFamily: fontFamily,
			fill: conf.stroke,
		})
		stxt.offsetX(stxt.width()/2)
		stxt.position({x:szx,y:szy})
		u.add(stxt)		
	}
	if (conf.lbl) {
 		let ltxt = new Konva.Text({
			text: conf.lbl,
			fontSize: lz,
			fontFamily: fontFamily,
			fill: conf.stroke,
		})
		// for long labels we must push this down
		if (ltxt.width() < rw)
			ltxt.offsetX(ltxt.width()/2)
		else
			ltxt.offsetX(ltxt.width() - rw/2)
		ltxt.position({x:lx,y:ly})
		ltxt.rotate(-90)
		u.add(ltxt)
	}
	if (scl) u.scale(scl)
	return u
}

// Add .img and .i field in the array. The function is async when images=true
export async function defineUnitImg(_images=false) {
	for (const [i, u] of units.entries()) {
		u.i = i
		if (imageOffset) {
			let img = await createUnit(u).toImage()
			// u.img should be a Konva.Group to allow adding markers
			u.img = new Konva.Group()
			u.img.add(new Konva.Image({
				image: img,
				offset: imageOffset,
			}))
		} else {
			u.img = createUnit(u)
		}
		u.img.id(`hunit${i}`)
	}
}

// ----------------------------------------------------------------------
// Utils

export function fromImg(img) {
	// Since u.img is a Konva.Group, the clicked item may be anything in it
	let g = img.findAncestor('Group', true)
	i = Number(g.id().substring(5))
    return units[i]
}
export function toStr(u) {
	const def = {
		nat: 'unknown',
		type: 'res',
		stat: '',
		sz: '',
		lbl: '',
	}
	for (var prop in u) if (prop in def) def[prop] = u[prop]
	return `${def.nat},${def.type},${def.stat},${def.sz},${def.lbl}`
}

// This function should be called after the user has placed a unit,
// for instance from 'dragend'
export function snapToHex(e) {
	let u = fromImg(e.target)
	let hex = grid.pixelToHex(e.target.position())
	u.hex = hex
	let pos = grid.hexToPixel(hex)
	e.target.position(pos)
}

// uh example {u:"ru,inf,4-2,II,", hex: {x:16,y:12}} (as saved)
export function place(uh, parent, draggable=false, useIndex=true) {
	let u
	if (uh.i && useIndex) {
		u = units[uh.i]
		u.selected = true
	} else
		u = fromStr(uh.u, (u)=>u.selected)
	if (u) {
		u.hex = uh.hex
		u.img.position(grid.hexToPixel(uh.hex))
		u.img.draggable(draggable)
		if (draggable) {
			u.img.on('dragstart', (e)=>e.target.moveToTop())
			u.img.on('dragend', snapToHex)
		}
		parent.add(u.img)
	}
}

// 
// For "generic" units, like "ge,air,5-4" where we want *any*
// unit that match, but NOT the same unit, do:
//   unselectAll()
//   u = fromStr("ge,air,5-4", (u)=>u.selected)
export function unselectAll() {
	for (const u of units) {
		delete u.selected
	}
}
export function fromStr(str, filterOut) {
	// By default no units are filtered. Useful filters may be:
	//   (u)=>u.selected   - exclude already selected
	//   (u)=>u.hex        - exclude placed units
	if (!filterOut) filterOut=((u) => false)
	// return the first found unit that matches str
	let unit
	v = str.split(',')
	nat = v[0]
	type = v[1]
	for (const u of units) {
		const def = {
			nat: 'unknown',
			type: 'res',
			stat: '1',
			sz: '',
			lbl: '',
		}
		for (var prop in u) if (prop in def) def[prop] = u[prop]
		if (filterOut(u)) continue
		if (v[0] != def.nat) continue
		if (v[1] != def.type) continue
		if (v[2] != def.stat) continue
		if (v[3] != def.sz) continue
		if (v[4] != def.lbl) continue
		unit = u
		break
	}
	if (unit) unit.selected = true
	return unit
}

// In a stack, all units base-shapes shall have a shadow
function updateShadow(hex) {
	let h = map.getHex(hex)
	if (!h || !h.units) return
	if (h.units.size > 1) {
		for (const u of h.units) {
			let base = u.img.findOne(".base")
			base.shadowEnabled(true)
			base.shadowColor('gray')
			base.shadowBlur(10)
			base.shadowOffset({x:4,y:4})
		}
	} else {
		for (const u of h.units) {
			let base = u.img.findOne(".base")
			base.shadowEnabled(false)
		}
	}
}
export function moveTo(u, hex, tween=true) {
	if (!hex) return
	let ohex = u.hex
	map.removeUnit(u)
	map.addUnit(u, hex)
	if (ohex) updateShadow(ohex)
	updateShadow(hex)
	let pos = grid.hexToPixel(hex)
	if (tween && ohex) {
		addMark1(u, 'red')
		u.ohex = ohex
		new Konva.Tween({
			node: u.img,
			x: pos.x,
			y: pos.y,
			duration: 0.5,
			easing: Konva.Easings.EaseInOut,
		}).play()		
	} else
		u.img.position(pos)		// (snapToHex)
}
export function regretMove(u, tween=true) {
	if (!u) return
	if (!u.ohex) return
	moveTo(u, u.ohex, tween)
	removeMark1(u)
	delete u.ohex
}
export function rotateStack(hex) {
	let h = map.getHex(hex)
	if (!h) return
	if (h.units && h.units.size > 1) {
		let bottomUnit, z = 1000000
		for (const u of h.units) {
			if (u.img.zIndex() < z) {
				z = u.img.zIndex()
				bottomUnit = u
			}
		}
		bottomUnit.img.moveToTop()
	}
}

// ----------------------------------------------------------------------
// Marks
// It is often useful to mark units, e.g. "has moved". Two rectangular
// marks on the left side of the unit is supported. No text.

const markTemplate = new Konva.Rect({
	width: side/6,
	height: side/6,
})

export function addMark1(u, fill) {
	let mark = u.img.findOne('.mark1')
	if (mark) {
		// Convert to update
		mark.fill(fill)
		return
	}
	mark = markTemplate.clone({
		x: 0,
		y: side/10,
		fill: fill,
		name: 'mark1',
	})
	if (imageOffset) mark.offset(imageOffset)
	u.img.add(mark)
}
export function removeMark1(u) {
	let mark = u.img.findOne('.mark1')
	if (mark) mark.destroy()
}
export function addMark2(u, fill) {
	let mark = u.img.findOne('.mark2')
	if (mark) {
		// Convert to update
		mark.fill(fill)
		return
	}
	mark = markTemplate.clone({
		x: 0,
		y: side/3,
		fill: fill,
		name: 'mark2',
	})
	if (imageOffset) mark.offset(imageOffset)
	u.img.add(mark)
}
export function removeMark2(u) {
	let mark = u.img.findOne('.mark2')
	if (mark) mark.destroy()
}


// ----------------------------------------------------------------------
// UnitBox

// The UnitBox holds one row of units to deploy, a label, and an
// optional info-text. If unitTypes are provided, an unit image is
// drawn in the unit squares

let unitBoxCnt = 0
let unitBoxes = new Map()		// key is the KonvaGroup (box) id()

// Init these *after* scale is set
let unitSquareSide
let unitSquareTemplate

export class UnitBox {
	cols = 4
	x = 400
	y = 100
	text = "Units"
	box
	destroyCallback
	unitTypes = []
	userRef
	mustBeEmpty = false
	#sizeC = unitSquareSide + 6
	#offsetX = 10
	#offsetY = 50
	#units = new Set()
	#colCnt = []
	constructor(obj = {}) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				this[prop] = obj[prop];
			}
		}
		if (this.unitTypes.length > 0) this.cols = this.unitTypes.length
		for (let c = 0; c < this.cols; c++) this.#colCnt.push(0)
		unitBoxCnt++
		this.box = new Konva.Group({
			x: this.x,
			y: this.y,
			name: 'unitbox',
			id: `unitbox${unitBoxCnt}`,
			draggable: true,
		})
		unitBoxes.set(this.box.id(), this)
		this.box.on('dragstart', (e)=>e.target.moveToTop())
		let width = this.cols * this.#sizeC + this.#offsetX*2
		let height = side * scale + 100
		this.box.add(new Konva.Rect({
			x: 0,
			y: 0,
			width: width,
			height: height,
			fill: 'gray',
			opacity: 0.75,
			cornerRadius: 20,
		}))
		let close = box.X.clone({
			x: width - 40,
			y: 15,
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
		for (let c = 0; c < this.cols; c++) this.#addUnitSquare(c)
	}
	#addUnitSquare(col) {
		this.box.add(unitSquareTemplate.clone({
			x: col * this.#sizeC + this.#offsetX,
			y: this.#offsetY,
		}))
		this.box.add(new Konva.Text({
			text: '0',
			fill: 'white',
			x: col * this.#sizeC + 3 + this.#sizeC/2,
			y: this.#offsetY + this.#sizeC,
			align: 'center',
			name: `ctxt${col}`,
			fontStyle: 'bold',
			fontSize: 16,
			fontFamily: fontFamily,
		}))
		if (this.unitTypes.length == 0) return
		for (const [c, t] of this.unitTypes.entries()) {
			const img = createUnit({
				color: 'gray',
				stroke: '#bbbbbb',
				type: t.type,
				stat: t.stat,
			})
			img.position({
				x: c * this.#sizeC + this.#sizeC/2 + this.#offsetX - 3,
				y: this.#offsetY + this.#sizeC * 0.5 -3 ,
			})
			img.opacity(0.6)
			this.box.add(img)
		}
	}
	updateUnitSquare() {
		for (let c = 0; c < this.cols; c++) {
			let name = `.ctxt${c}`
			let cnt = this.#colCnt[c]
			this.box.findOne(name).text(`${cnt}`)
		}
	}
	destroy() {
		if (this.mustBeEmpty && this.#units.size > 0) {
			alert("Please, place all units")
			return
		}
		unitBoxes.delete(this.box.id())

		// Hide the group object
		this.box.hide()
		// remove all remaining unit images from the group
		for (const u of this.#units) {
			u.img.remove()
			delete u.col
		}
		this.#units.clear()	  // (prevent memory leak)
		// then destroy the group (and all remaining childs)
		// It is assumed that all eventHandlers are deleted too
		this.box.destroy()
		if (this.destroyCallback) this.destroyCallback(this)
	}
	// Find this object from a child, e.g. on click
	static #me(e) {
		let box = e.target.findAncestor('.unitbox')
		return unitBoxes.get(box.id())
	}
	// This is a 'click' event callback
	static #destroy(e) {
		UnitBox.#me(e).destroy()
	}
	// dragstart for units in the box
	static #dragstart(e) {
		UnitBox.#me(e).place(e)
	}
	place(e) {
		// e.target is a unit.img
		e.target.moveTo(this.box.getParent())
		e.target.moveToTop()
		e.target.on('dragend', snapToHex)
		// replace myself! NOTE: you *must* 'off' the old callback!!
		e.target.off('dragstart')
		e.target.on('dragstart', (e)=>e.target.moveToTop())
		let u = fromImg(e.target)
		this.#colCnt[u.col]--
		this.updateUnitSquare()
		delete u.col
		this.#units.delete(u)
	}
	addUnit(u, col) {
		if (this.#units.has(u)) return // already added
		if (typeof(col) == 'undefined') {
			col = this.#findCol(u)
			if (col < 0) {
				alert("BUG: adding unknown unit to UnitBox")
				return
			}
		}
		this.#units.add(u)
		u.col = col
		this.#colCnt[col]++
		this.updateUnitSquare()
		u.img.draggable(true)
		u.img.on('dragstart', UnitBox.#dragstart)
		// The unit images have it's origin in the center, while the
		// unitSquares have top-left. Complensate.
		let x = col * this.#sizeC + this.#offsetX + (side*scale/2) + 3
		let y = this.#offsetY + (side*scale/2) + 3
		u.img.x(x)
		u.img.y(y)
		this.box.add(u.img)
	}
	#findCol(u) {
		for (const [i, t] of this.unitTypes.entries()) {
			if (u.type == t.type) {
				if (u.type == 'gen' || u.type == 'ab')
					return i
				if (u.stat == t.stat) return i
			}
		}
		return -1
	}
}

// ----------------------------------------------------------------------
// NOTE: if the last param is defined as images=false it interferes
//    with the import, but the compiler doesn't complain!!
export async function init(_units, _nations={}, _scale=1.0, _images=false) {
	scale = _scale
	units = _units
	nations = _nations
	if (images.loaded) {
		hussarImg.src = images.hussarData
		await new Promise(resolve => hussarImg.onload = resolve)
	}
	if (_images) imageOffset = {x:side/2*scale, y:side/2*scale}
	await defineUnitImg(_images)
	unitSquareSide = side * scale + 6
	unitSquareTemplate = new Konva.Rect({
		width: unitSquareSide,
		height: unitSquareSide,
		stroke: '#bbbbbb'
	})
}
