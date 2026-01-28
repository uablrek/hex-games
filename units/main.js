// SPDX-License-Identifier: CC0-1.0.
/*
  Units for turn-based games on hex grids.
  
  These are created as Korva.Group's, but may be converted to images
  to prevent frequent rendering.
 */
import Konva from 'konva'
import * as hex from './hex-grid.js'
import * as units from './units.js'

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,
})

const board = new Konva.Layer({
	draggable: true,
})
stage.add(board)


function placeUnits() {
	let u
	u = units.createUnit('black', 'white', 'pz', '4-6', '', '56')
	u.position(hex.hexToPixel({x: 4, y:3}))
	board.add(u)

	u = units.createUnit('olive', 'black', 'inf', '3-4', '', '3')
	u.position(hex.hexToPixel({x: 6, y:3}))
	board.add(u)

	u = units.createUnit('darkgreen', 'black', 'res', '1', '', '')
	u.position(hex.hexToPixel({x: 8, y:3}))
	board.add(u)

	u = units.createUnit('brown', 'black', 'mec', '2-5', '', 'Col')
	u.position(hex.hexToPixel({x: 10, y:3}))
	board.add(u)

	u = units.createUnit('olive', 'black', 'cav', '5-6', 'xx', 'Gdg 1234')
	u.position(hex.hexToPixel({x: 4, y:5}))
	board.add(u)

	u = units.createUnit('olive', 'black', 'art', '8-3', 'xx', 'Nap')
	u.position(hex.hexToPixel({x: 6, y:5}))
	board.add(u)

	u = units.createUnit('olive', 'black', 'air', '5-4', '', '')
	u.position(hex.hexToPixel({x: 8, y:5}))
	board.add(u)

	u = units.createUnit('olive', 'black', 'ab', '', '', '')
	u.position(hex.hexToPixel({x: 10, y:5}))
	board.add(u)

	u = units.createUnit('olive', 'black', 'nav', '9', '', '')
	u.position(hex.hexToPixel({x: 4, y:7}))
	board.add(u)

	u = units.createUnit('black', 'white', 'nav', '9', '', '')
	u.position(hex.hexToPixel({x: 8, y:7}))
	board.add(u)

	u = units.createUnit('lightblue', 'black', 'gen', '10', '', 'Napoleon')
	u.position(hex.hexToPixel({x: 10, y:7}))
	board.add(u)

	u = units.createUnit('black', 'white', 'par', '3-3', '', '1 Fsj')
	u.position(hex.hexToPixel({x: 4, y:9}))
	board.add(u)
}

async function placeUnitImages() {
	let u = await units.createUnitImage('black', 'white', 'pz', '4-6', '', '2 SS')
	u.position(hex.hexToPixel({x: 6, y:7}))
	board.add(u)
}

;(async () => {
	await units.init(1.5)
	hex.configure(100)
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
	placeUnits()
	await placeUnitImages()
})()
