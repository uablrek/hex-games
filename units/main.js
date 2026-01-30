// SPDX-License-Identifier: CC0-1.0.
/*
  Units for turn-based games on hex grids.
  
  These are created as Korva.Group's, but may be converted to images
  to prevent frequent rendering.
 */
import Konva from 'konva'
import * as hex from './hex-grid.js'
import * as unit from './units.js'
import * as box from './textbox.js'

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,
})

const board = new Konva.Layer({
	draggable: true,
})
stage.add(board)

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
	{nat:'ge', color:'red', stroke:'green', type:'nav', stat:'9'},
	{nat:'fr', type:'gen', stat:'(10)6', lbl:'Napoleon'},
	{nat:'ge', type:'par', stat:'3-3', lbl:'1 Fsj'},
]
function placeUnits() {
	let x = 2
	let y = 2
	for (const u of units) {
		u.img.position(hex.hexToPixel({x:x, y:y}))
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
}

;(async () => {
	await unit.init(units, nations, 1.2, true)
	hex.configure(80)
	let pattern = new Image()
	pattern.src = hex.patternSvg()
	await new Promise(resolve => pattern.onload = resolve)
	const grid = new Konva.Rect({
		width: window.innerWidth,
		height: window.innerHeight,
		stroke: 'black',
		fillPatternImage: pattern,
		fillPatternScale: hex.patternScale(),
	})
	board.add(grid)
	board.add(theBox)
	placeUnits()
})()
