// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a test program for for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import {ui, grid, box} from '@uablrek/hex-games'
import * as scenario from './scenario.js'
import * as map from './map.js'
import * as units from './units.js'
const dbg = console.log
const board = ui.stage()
const info = new Konva.Layer({name: "info"})
board.getStage().add(info)
let shownMap

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
	let scenarioName = "Norway"
	const myUrl = new URL(location.href)
	const param = myUrl.searchParams.get("scenario")
	if (param) scenarioName = param
	let rc = await scenario.init(scenarioName)
	if (rc != 0) {
		alert(`Invalid scenario: ${scenarioName}`)
		return
	}
	shownMap = map.image.clear
	board.add(shownMap)
	board.add(map.hexGrid)
	// Add units
	await units.init()
	for (const u of scenario.sc.data.units) {
		let type = units.type[u.id]
		// Use transport for non-air units on ocean hexes
		if (type.movt != "air") {
			const h = map.getHex(u.hex)
			if (u.trsp && h.terrain == "ocean")
				type = units.type[u.trsp]
		}
		const player = units.player(type)
		const orientation = scenario.sc.data.players[player].orientation
		const img = type.img[orientation].clone({
			offset: type.offset,
		})
		const pos = grid.hexToPixel(u.hex)
		img.position(pos)
		board.add(img)
	}
	// Add a marker to check grid.hexToPixel()
	if (true) {
		const marker = new Konva.Circle({
			radius: 10,
			fill: "red",
			stroke: "black",
			position: grid.hexToPixel({x:0,y:0}),
		})
		board.add(marker)
	}
	// The 'mousemove' handler must be added to all maps, and the hex-grid
	map.image.clear.on('mousemove', updateHexInfo)
	map.hexGrid.on('mousemove', updateHexInfo)
	createInfoBox()
	updateInfoBox(scenarioName)
})()
