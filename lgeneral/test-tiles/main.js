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
	let x = 0
	for (const [k,t] of terrain.tdata.entries()) {
		for (let i = 0; i < t.tile.length; i++) {
			bg.add(t.tile[i].clone({
				x: x,
				y: y,
			}))
			x += 62
			if (x > (62*30)) {
				x = 0
				y += 52
			}
		}
	}
	const timg = await bg.toImage()
	const map = new Konva.Image({
		image: timg,
		draggable: true,
	})
	map.cache()
	board.add(map)
})()
