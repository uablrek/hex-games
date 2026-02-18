// SPDX-License-Identifier: CC0-1.0.
/*
  Units for turn-based games on hex grids.
  
  These are created as Korva.Group's, but may be converted to images
  to prevent frequent rendering.
 */
import Konva from 'konva'
import { unit, grid, box, setup } from './hex-games.js'
import * as gen from './unit-gen.js'

let board = setup.stage()

const nations = {
	ge: {color:'black', stroke:'white'},
	fr: {color:'lightblue'},
}
const units = [
	{nat:'ge' , type:'pz', stat:'4-6', lbl:'56'},
	{color:'olive', type:'inf', stat:'3-4', lbl:'3'},
	{color:'darkgreen'},
	{color:'brown', type:'mec', stat:'2-5', lbl:'Col'},
	{color:'olive', type:'cav', stat:'5-6', sz:'xx', lbl:'Gdg 1234'},
	{color:'olive', type:'art', stat:'8-3', sz:'xx', lbl:'Nap'},
	{color:'olive', type:'air', stat:'5-4'},
	{color:'olive', type:'ab'},
	{type:'nav', stat:'9'},
	{nat:'ge', color:'brown', stroke:'white', type:'nav', stat:'9'},
	{nat:'fr', type:'gen', stat:'(10)6', lbl:'Napoleon'},
	{nat:'ge', type:'par', stat:'3-3', lbl:'1 Fsj'},
]
function placeUnits() {
	let x = 2
	let y = 2
	for (const u of units) {
		u.img.position(grid.hexToPixel({x:x, y:y}))
		u.img.draggable(true)
		u.img.on('dragend', unit.snapToHex)
		u.img.on('click', onclick)
		u.img.on('dragstart', (e)=>e.target.moveToTop())
		board.add(u.img)
		x += 2
		if (x > 8) {
			y += 2
			x = 2
		}
	}
}
let theBox = box.info({
	label: 'Clicked Unit', 
	width: 300,
	x: 800,
	y: 100,
})
function onclick(e) {
	let u = unit.fromImg(e.target)
	box.update(theBox, unit.toStr(u))
	mark = u.img.findOne('.mark1')
	if (mark) {
		if (mark.fill() == 'gold') {
			unit.addMark1(u, 'red')
			unit.addMark2(u, 'green')
		} else {
			unit.removeMark1(u)
			unit.removeMark2(u)
		}
	} else
		unit.addMark1(u, 'gold')
}

let hussarImg
function ugenGen(conf, u, side) {
	u.add(new Konva.Image({
		x: side*0.2,
		y: side*0.05,
		image: hussarImg,
		scaleX: 0.045,
		scaleY: 0.045,
	}))
 	let txt = new Konva.Text({
		text: conf.stat,
		x: side * 0.48,
		y: side*0.65,
		fontSize: side*0.25,
		fontStyle: 'bold',
		fontFamily: 'sans-serif',
		fill: conf.stroke,
	})
	txt.offsetX(txt.width()/2)
	u.add(txt)
	if (conf.lbl) {
 		let ltxt = new Konva.Text({
			text: conf.lbl,
			fontSize: side * 0.18,
			fontFamily: 'sans-serif',
			fill: conf.stroke,
		})
		ltxt.offsetX(ltxt.width()/2)
		ltxt.position({x:side*0.8,y:side*0.5})
		ltxt.rotate(-90)
		u.add(ltxt)
	}
	return true
}

;(async () => {
	await gen.init()			// define the "gen" unit type
	unit.addUnitGenerator('nav', unit.ugenNav)
	unit.addUnitGenerator('ab', unit.ugenAb)
	await unit.init(units, nations, 1.2, false)

	grid.configure(80)
	let pattern = new Image()
	pattern.src = grid.patternSvg()
	await new Promise(resolve => pattern.onload = resolve)
	const hexGrid = new Konva.Rect({
		width: window.innerWidth,
		height: window.innerHeight,
		stroke: 'black',
		fillPatternImage: pattern,
		fillPatternScale: grid.patternScale(),
	})
	board.add(hexGrid)
	board.add(theBox)
	placeUnits()
})()
