// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a test program for for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import Konva from 'konva'
import {ui} from '@uablrek/hex-games'
import * as terrain from './terrain.js'
const dbg = console.log

;(async () => {
	ui.init()
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
	// without this the bg is only draggable when grabbing a tile
	const map = new Konva.Image({
		image: await bg.toImage(),
	})
	//map.cache()  // not really needed for a Konva.Image
	ui.board.add(map)
})()
