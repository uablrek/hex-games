# A library for creating turn-based games on hex-grids

A browser (client/frontend) oriented library. Supports:

* Draggable map
* Unit (counter) generation
* Grid conversion, distance neighbour, movement functions
* Game sequences
* Text and unit (counter) boxes

Please read more at [github](
https://github.com/uablrek/hex-games/blob/main/HEXGAMES.md).

## A map/grid example

The map is draggable, but not scrollable. Click on a hex to show
coordinates in the (fixed position) info box.

```js
// SPDX-License-Identifier: CC0-1.0.
/*
  This is a map/grid test for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import {ui, grid, box} from '@uablrek/hex-games'
import mapData from './waterloo.png'

const board = ui.stage()		// (board is a draggable Konva.Layer)
const info = new Konva.Layer({name: "info"})
let infoBox

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
	info.add(infoBox)
}
function updateInfoBox(e) {
	if (!e) {
		box.update(infoBox, "Click on the map")
		return
	}
	const pos = board.getRelativePointerPosition()
	const hex = grid.pixelToHex(pos)
	let txt = `Pos: ${pos.x}, ${pos.y}\n`
	txt += `Hex: ${hex.x}, ${hex.y}\n`
	const id = hexToNaw(hex)
	txt += `Id: ${id}\n`
	const hx = nawToHex(id)
	txt += `Hex from id: ${hx.x}, ${hx.y}`
	box.update(infoBox, txt)
	placeMarker(hex)
}
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
	if (!marker.getParent()) board.add(marker)
}

// ----------------------------------------------------------------------
// Main
;(async () => {
	const mapImage = await ui.mapImage(mapData)
	board.add(mapImage)
	grid.configure(71.6, 1.0, {x:12, y:26}, true)
	board.getStage().add(info)
	createInfoBox()
	board.on('click', updateInfoBox)
})()
```
