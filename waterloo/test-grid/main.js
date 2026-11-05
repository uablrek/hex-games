// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is a map/grid test for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import {ui, grid, box} from '@uablrek/hex-games'
import mapData from './waterloo.png'

let infoBox
let ref							// Axial coordinate of La Haye Sainte

// ----------------------------------------------------------------------
// InfoBox
// An infobox showing coordinates. The box is on a different "layer"
// than the map, so it remains at the same position when the map is
// dragged. The InfoBox is updated on a click on the board

function createInfoBox() {
	infoBox = box.info({
        x: window.innerWidth - 450,
        y: 30,
        width: 400,
        height: 200,
        destroyable: false,
    })
    updateInfoBox()
	ui.info.add(infoBox)
}
function updateInfoBox(e) {
	if (!e) {
		box.update(infoBox, "Click on the map")
		return
	}
	const pos = ui.board.getRelativePointerPosition()
	pos.x = Math.round(pos.x)
	pos.y = Math.round(pos.y)
	const hex = grid.pixelToHex(pos)
	let txt = `Pos: ${pos.x}, ${pos.y}\n`
	txt += `Hex: ${hex.x}, ${hex.y}\n`
	const id = hexToNaw(hex)
	txt += `Id: ${id}\n`
	const hx = nawToHex(id)
	txt += `Hex from id: ${hx.x}, ${hx.y}\n`
	const ax = grid.hexToAxial(hex)
	txt += `Axial: q:${ax.q}, r:${ax.r}\n`
	const dist = grid.axialDistance(ref, ax)
	txt += `Dist: ${dist}`
	box.update(infoBox, txt)
	placeMarker(hex)
}
// These functions are copied
function hexToNaw(hex) {
	const x = String(hex.x - 3).padStart(2, '0')
	const y = String(hex.y).padStart(2, '0')
	return x + y
}
function nawToHex(id) {
	const x = parseInt(id.substring(0,2), 10) + 3
	const y = parseInt(id.substring(2), 10)
	return {x:x,y:y}
}

// ----------------------------------------------------------------------
// Marker
// A marker placed on a hex
const marker = new Konva.Circle({
	stroke: 'black',
	fill: 'red',
	radius: 10,
})
function placeMarker(hex) {
	const pos = grid.hexToPixel(hex)
	marker.position(pos)
	if (!marker.getParent()) ui.board.add(marker)
}

// ----------------------------------------------------------------------
// Main
;(async () => {
	ui.init()
	const mapImage = await ui.mapImage(mapData)
	ui.board.add(mapImage)
	const o = {x:12, y:26}
	grid.configure(71.6, 1.0, o, true)
	// superimpose a generated grid on the map
    const pattern = new Image()
    pattern.src = grid.patternSvg("black")
    await new Promise(resolve => pattern.onload = resolve)
	const hexGrid = new Konva.Rect({
		width: 1800,
		height: 1300,
		fillPatternImage: pattern,
		fillPatternRepeat: 'repeat',
		fillPatternScale: grid.patternScale(),
		offset: o,
	})	
	hexGrid.cache()
	ui.board.add(hexGrid)
	
	ref	= grid.hexToAxial(nawToHex('1310'))
	createInfoBox()
	ui.board.on('click', updateInfoBox)
})()
