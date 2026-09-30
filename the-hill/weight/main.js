// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a test program for influence maps for:
  https://github.com/uablrek/hex-games/

  * https://jvm-gaming.org/t/influence-maps-with-example-wargame/55850
 */

import Konva from 'konva'
import {ui, grid, map} from '@uablrek/hex-games'
import mapData from './example-map.svg'
let board = ui.stage()
const log = console.log
const dbg = function(){}

// Assign weight values to hexes centered around 'hex' at max
// distance 'N'.
// Prerequisite: the map is initiated, and all map-objects has '.weight',
//   and grid.mapFunctions() is called (with at least 'getAxial').
function assignWeight(hex, N, weightFn) {
	if (!weightFn) weightFn = function(d, N) {
		const w = N + 1 - d
		return w < 0 ? 0 : w
	}
	const h = map.getHex(hex)
	const s = grid.inRangeAxial(N, h.ax)
	for (const n of s.values()) {
		const d = grid.axialDistance(h.ax, n.ax)
		n.weight += weightFn(d, N)
	}
}

// ----------------------------------------------------------------------
// Main
const objects = [{x:4,y:8}, {x:3,y:9}, {x:4,y:9}]

;(async () => {
	let mapImage = await ui.mapImage(mapData)
	grid.configure(50)
	map.init({
        width: 28,
        height: 23,
    })
	grid.mapFunctions(map.getAxial)
	for (const h of map.hexMap.values())
		h.weight = 0
	for (const o of objects)
		assignWeight(o, 15)
	// Boost the object closest to the French
	assignWeight({x:4,y:9}, 1)
	board.add(mapImage)
	for (const h of map.hexMap.values()) {
		const pos = grid.hexToPixel(h.hex)
		const w = new Konva.Text({
			position: pos,
			text: `${h.weight}`,
			fontStyle: 'bold',
		})
		w.offset({x:5,y:5})
		board.add(w)
	}
})()
