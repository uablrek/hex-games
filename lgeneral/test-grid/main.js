// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a test program for for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import {ui, grid} from '@uablrek/hex-games'
import * as terrain from './terrain.js'
const dbg = console.log

const board = ui.stage()

;(async () => {
	await terrain.init()
    grid.configure(50, 1.02, {x:0,y:0}, true)
    const pattern = new Image()
    pattern.src = grid.patternSvg("black")
    await new Promise(resolve => pattern.onload = resolve)
    const hexGrid =  new Konva.Rect({
        width: 2000,
        height: 1000,
        fillPatternImage: pattern,
        fillPatternRepeat: 'repeat',
        fillPatternScale: grid.patternScale(),
    })
    hexGrid.cache()
	// Get a hex-tile
	const t = terrain.tdata.get("clear").tile[14]
	for (let x = 5; x < 15; x++) {
		for (let y = 4; y < 12; y++) {
			const pos = grid.hexToPixel({x:x, y:y})
			const h = t.clone({
				position: pos,
			})
			board.add(h)
		}
	}
	board.add(hexGrid)
})()
