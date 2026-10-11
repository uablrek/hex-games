// SPDX-License-Identifier: CC-BY-4.0.
/*
  Handles the map for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
*/

import {ui, grid, map} from '@uablrek/hex-games'
import mapData from './rdtr-map.png'
import mapProperties from './rdtr-map.json'
const log = console.log
let view

export const width = 52
export const height = 41

export async function init() {
	grid.configure(58.7, 0.988, {x:57, y:23})
	map.init({
		width: width,
		height: height,
		mapProperties: mapProperties,
	})
	ui.board.add(await ui.mapImage(mapData))
	view = grid.pixelToHex({x:ui.board.width(), y:ui.board.height()})
}

// Center the map-view on chex by scrolling the board
export function center(chex, clamp = true) {
	// Compute the upper left hex
	const ul = {x: chex.x-view.x/2, y:chex.y-view.y/2}
	if (clamp) {
		const min = {x:1, y:0}
		if (ul.x < min.x) ul.x = min.x
		if (ul.y < min.y) ul.y = min.y
		const max = {x:width-view.x+1, y:height-view.y}
		if (ul.x > max.x) ul.x = max.x
		if (ul.y > max.y) ul.y = max.y
	}
	const pos = grid.hexToPixel(ul)
    new Konva.Tween({
        node: ui.board,
        x: -pos.x,
        y: -pos.y,
        duration: 0.5,
        easing: Konva.Easings.EaseInOut,
    }).play()               
}
export function isVisible(hex) {
	const ul = grid.pixelToHex({x:-ui.board.x(),y:-ui.board.y()}) // upper left
	const lr = {x: ul.x+view.x, y:ul.y+view.y} // lower right
	//log("visible", ul, lr)
	if (hex.x <= ul.x) return false
	if (hex.y <= ul.y) return false
	if (hex.x >= lr.x) return false
	if (hex.y >= lr.y) return false
	return true
}
export function scroll(e) {
	const ul = grid.pixelToHex({x:-ui.board.x(),y:-ui.board.y()}) // upper left
	switch (e.key) {
	case 'ArrowUp':
		ul.y -= view.y - 3
		break
	case 'ArrowDown':
		ul.y += view.y - 3
		break
	case 'ArrowLeft':
		ul.x -= view.x - 3
		break
	case 'ArrowRight':
		ul.x += view.x - 3
		break
	}
	const chex = {x:ul.x+view.x/2, y:ul.y+view.y/2}
	center(chex)
}
