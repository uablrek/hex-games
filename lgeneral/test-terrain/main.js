// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a test program for for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import {ui} from '@uablrek/hex-games'
import * as terrain from './terrain.js'
const dbg = console.log

const board = ui.stage()

;(async () => {
	await terrain.init()
	const bg = new Konva.Group()
	let y = 0
	for (const t of terrain.tdata.values()) {
		bg.add(new Konva.Image({
			y: y,
			image: t.img,
		}))
		y += 64
	}
	const timg = await bg.toImage()
	const map = new Konva.Image({
		image: timg,
		draggable: true,
	})
	map.cache()
	board.add(map)
})()
