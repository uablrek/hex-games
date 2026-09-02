// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a test program for for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import {ui, grid} from '@uablrek/hex-games'
import * as terrain from './terrain.js'
import * as map from './map.js'
const dbg = console.log
const board = ui.stage()

// Keyboard
ui.setKeys([
	{key:'h', fn:hexGrid},
	{key:'c', fn:setMap},
	{key:'m', fn:setMap},
	{key:'s', fn:setMap},
])
function hexGrid() {
	if (map.hexGrid.getParent())
		map.hexGrid.remove()
	else
		board.add(map.hexGrid)
}
let shownMap
function setMap(e) {
	let img
	switch (e.key) {
	case 'c':
		img = map.image.clear
		break
	case 'm':
		img = map.image.mud
		break
	case 's':
		img = map.image.snow
		break
	}
	if (img == shownMap) return	// already shown
	// The hide/show thing is an attempt to avoid noises on screen.
	// However, it doesn't seem necessary. Just remove the old map image
	// and add/moveToBottom the new one looks fine on my computer
	img.hide()
	board.add(img)
	img.moveToBottom()
	img.show()
	shownMap.remove()
	shownMap = img
}

// ----------------------------------------------------------------------
// main
;(async () => {
	await terrain.init()
	let mapName = "map03"
	const myUrl = new URL(location.href)
	const param = myUrl.searchParams.get("map")
	if (param) mapName = param
	let rc = await map.init(mapName)
	if (rc != 0) {
		alert(`Invalid map: ${mapName}`)
		return
	}
	shownMap = map.image.clear
	board.add(shownMap)
	hexGrid()
})()
