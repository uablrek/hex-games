// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a test program for for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import {ui} from '@uablrek/hex-games'
import * as units from './units.js'
const dbg = console.log
const board = ui.stage()

// ----------------------------------------------------------------------
// main
;(async () => {
	await units.init()
	const w = 100
	const h = 80
	let x = 0
	let y = 0
	const bg = new Konva.Group()
	for (const [i,u] of units.type.entries()) {
		if (u.id != i) alert(`Fail id: ${unit.id} != ${i}`)
		const g = new Konva.Group({
			x: x,
			y: y,
			width: w,
			height: h,
		})
		const img = u.img.right
		img.offset(u.offset)
		img.position({x:50, y:20})
		g.add(img)
		const t = new Konva.Text({
			y: 50,
			width: w,
			text: u.name,
			align: 'center',
		})
		g.add(t)
		bg.add(g)
		x += w
		if (x > 1600) {
			x = 0
			y += h
		}
	}
	const bgImage = await bg.toImage()
	const bgImg = new Konva.Image({
		image: bgImage,
	})
	bgImg.cache()
	board.add(bgImg)
})()
