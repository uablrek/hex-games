// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a test program for for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import Konva from 'konva'
import {ui, grid} from '@uablrek/hex-games'
import * as map from './map.js'
const dbg = console.log
const board = ui.stage()

function randomHex() {
	const x = Math.floor(Math.random()*map.width)
	const y = Math.floor(Math.random()*map.height)
	return {x:x, y:y}
}

function createInSight() {
	const n = Math.floor(map.width * map.height / 50)
	let s = new Set()
	for (let i = 0; i < n; i++) {
		const ax = grid.hexToAxial(randomHex())
		const d = Math.floor(Math.random()*6)
		s = s.union(grid.inRangeAxial(d, ax))
	}
	return s
}

// ----------------------------------------------------------------------
// main
;(async () => {
	let mapName = "map03"
	const myUrl = new URL(location.href)
	const param = myUrl.searchParams.get("map")
	if (param) mapName = param
	let rc = await map.init(mapName)
	if (rc != 0) {
		alert(`Invalid map: ${mapName}`)
		return
	}
	const shownMap = map.image.clear
	board.add(shownMap)
	board.add(map.hexGrid)
	const o = map.outOfSight(createInSight())
	const mask = new Konva.Group()
	for (const h of o.values()) {
		const pos = grid.hexToPixel(h.hex)
		mask.add(map.hmask.clone({
			position: pos,
		}))
	}
	mask.cache()
	board.add(mask)
})()
