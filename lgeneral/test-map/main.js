// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a test program for for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import {ui, grid, box} from '@uablrek/hex-games'
import * as terrain from './terrain.js'
import * as map from './map.js'
const dbg = console.log
const board = ui.stage()
const info = new Konva.Layer({name: "info"})
board.getStage().add(info)

// Keyboard
ui.setKeys([
	{key:'h', fn:hexGrid},
	{key:'c', fn:setMap},
	{key:'m', fn:setMap},
	{key:'s', fn:setMap},
])
function hexGrid() {
	if (map.hexGrid.isVisible())
		map.hexGrid.hide()
	else {
		map.hexGrid.position(shownMap.position())
		map.hexGrid.show()
	}
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

// Infobox
let infoBox
function createInfoBox() {
	window.innerWidth
    infoBox = box.info({
        x: window.innerWidth/2 - 200,
        y: 30,
        width: 400,
        height: 50,
        destroyable: false,
    })
    info.add(infoBox)
}
function updateInfoBox(info) {
	box.update(infoBox, "", info)
}
let currentHex = null
function updateHexInfo(e) {
	const h = map.hexFromPointer(shownMap.getRelativePointerPosition())
	if (h != currentHex) {
		currentHex = h
		updateInfoBox(h ? h.name : " ")
	}
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
	board.add(map.hexGrid)
	if (true) {
		shownMap.on('mousemove', updateHexInfo)
		map.hexGrid.on('mousemove', updateHexInfo)
	}
	createInfoBox()
	const scenario = map.maps[mapName].name
	updateInfoBox(scenario)
})()
