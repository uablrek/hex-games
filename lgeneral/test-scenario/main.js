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
	// align the new map with the shown one
	img.position(shownMap.position())
	board.add(img)
	img.moveToBottom()
	img.show()
	shownMap.remove()
	shownMap = img
}

// Infobox
let infoBox
function createInfoBox() {
	const w = 540
	window.innerWidth
    infoBox = box.info({
        x: window.innerWidth/2 - w/2,
        y: 30,
        width: w,
        height: 50,
        destroyable: false,
    })
    info.add(infoBox)
}
function updateInfoBox(info) {
	box.update(infoBox, "", info)
}
let currentHex = null
let currentUnit = null
function updateHexInfo(e) {
	const h = map.hexFromPointer(shownMap.getRelativePointerPosition())
	if (h != currentHex) {
		currentHex = h
		if (h) {
			let data = `${h.name} (${h.hex.x},${h.hex.y})`
			if (h.units && h.units.size > 0) {
				for (const u of h.units.values())
					data += `, ${u.t.name}`
			}
			updateInfoBox(data)
		} else
			updateInfoBox(" ")
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
	const axisOrientation = scenario.sc.data.players["axis"].orientation
	await units.init(scenario.sc.data.units, axisOrientation)
	for (const u of scenario.sc.data.units) {
		if (!u.hex) continue	// delayed?
		// Use transport for non-air units on ocean hexes
		let img = u.img
		const h = map.getHex(u.hex)
		if (u.t.move_type != "air" && h.terrain == "ocean") {
			if (u.trsp && u.trsp != "none") img = u.timg
		}
		const pos = grid.hexToPixel(u.hex)
		img.position(pos)
		board.add(img)
		// Add the unit to the map hex-object
		if (!h.units) h.units = new Set()
		h.units.add(u)
	}
	// Add a marker to check grid.hexToPixel()
	if (false) {
		board.add(new Konva.Circle({
			radius: 10,
			fill: "red",
			stroke: "black",
			position: grid.hexToPixel({x:0,y:0}),
		}))
	}
	// The 'mousemove' handler must be added to all maps, and the hex-grid
	map.image.clear.on('mousemove', updateHexInfo)
	map.image.mud.on('mousemove', updateHexInfo)
	map.image.snow.on('mousemove', updateHexInfo)
	map.hexGrid.on('mousemove', updateHexInfo)
	createInfoBox()
	updateInfoBox(scenarioName)
})()
