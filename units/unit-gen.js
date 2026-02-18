// SPDX-License-Identifier: CC0-1.0.
/*
  Define the "gen" unit-type for:
  https://github.com/uablrek/hex-games/
*/

import Konva from 'konva'
import hussarData from './hussar.svg'
import {unit} from './hex-games.js'

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

export async function init() {
	hussarImg = new Image()
	hussarImg.src = hussarData
	await new Promise(resolve => hussarImg.onload = resolve)
	unit.addUnitGenerator('gen', ugenGen)	
}
