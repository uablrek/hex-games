// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the map module for:
  https://github.com/uablrek/hex-games/tree/main/the-hill
*/

import Konva from 'konva'
import {ui, grid, map} from '@uablrek/hex-games'
import {g} from './game.js'
import mapData from './realistic_map.svg'
import mapProperties from './map-data.json'

export const allHexes = new Set()

export async function init() {
	grid.configure(50)
	let mapImage = await ui.mapImage(mapData)
	ui.board.add(mapImage)
	map.init({
		width: 28,
		height: 23,
		mapProperties: mapProperties,
	})
	for (const h of map.hexMap.values()) {
		allHexes.add(h)
		if (h.prop && h.prop.includes("o")) g.objectives.push(h)
		h.units = new Set()
	}
	grid.mapFunctions(map.getAxial, blocked, getMovementCost, removeD)
}

function removeD() {
	for (const h of map.hexMap.values()) delete h.d
}
function blocked(h, n, i) {
	if (!n.prop) return false
	return n.prop.includes('x')
}
function getMovementCost(h,n,i,u) {
	if (n.units && n.units.size > 0) {
		// The hex is occupied
		for (const u of n.units)
			if (u.nat != g.nat) return 100 // enemy
	}
	let zoc = 0
	if (h.zoc && n.zoc) zoc = 3
	if (n.prop) {
		if (n.prop.includes('w')) return 100
		if (n.prop.includes('f')) {
			if (u.type == 'cav') return 3 + zoc
			if (u.type == 'art') return 100
			return 2
		}
		if (n.prop.includes('m')) {
			if (u.type == 'cav' || u.type == 'art') return 100
			return 3 + zoc
		}
	}
	if (h.prop && h.prop.includes('r')) return 2 + zoc
	if (h.edges && h.edges.charAt(i) == 'u') return 3 + zoc
	return 1 + zoc
}

export function recomputeZOC() {
	for (const h of map.hexMap.values()) h.zoc = false
	for (const u of g.units) {
		if (!u.hex) continue
		if (u.nat == g.nat) continue
		const h = map.getHex(u.hex)
		for (const n of grid.neighboursAxial(h.ax)) {
			if (n) n.zoc = true
		}
	}
}
