// SPDX-License-Identifier: CC0-1.0.
/*
  This is the map module for:
  https://github.com/uablrek/hex-games/

  Map-hex attributes:
  hex
  ax
  prop
  edges
  units - Set of unit references
  d - temporary during movement
  zoc - temporary during movement
  x - rdtr
  y - rdtr
  nat - rdtr
 */
import Konva from 'konva'
import {grid} from './hex-games.js'

export let map
export async function mapImage(mapData, image=true) {
	let mapImg = new Image()
	mapImg.src = mapData
	await new Promise(resolve => mapImg.onload = resolve)
	map = new Konva.Image({
		image: mapImg,
	})
	// Lesson to learn:
	// An SVG map seems to be re-rendered on drag, which burns a lot
	// of CPU. Pre-render the map-image - and drag seem more or less free
	if (image) {
		mapImg = await map.toImage()
		map = new Konva.Image({
			image: mapImg,
		})
	}
	map.addName("map")
	return map
}

let mapWidth = 0
let mapHeight = 0
export const hexMap = new Map()
export const axMap = new Map()

export function init(obj) {
	mapWidth = obj.width
	mapHeight = obj.height
	// The "map" is sparse, meaning that many hex'es are
	// "undefined". For the movementAxial() function to work, we must
	// define *all* hexes, and they must have a .ax field. Further, we
	// want to allow lookup with both offset and axial coordinates so
	// two Map's must be defined
	for (let x = 0; x < mapWidth; x++) {
		for (let y = 0; y < mapHeight; y++) {
			let hex, ax, h, key
			hex = {x:x,y:y}
			ax = grid.hexToAxial(hex)
			h = {hex:hex, ax:ax}
			key = x + 1000*y
			hexMap.set(key, h)
			key = ax.q + 1000*ax.r
			axMap.set(key, h)
		}
	}
	// Now all hex'es are defined, so add information from "map"
	for (const hp of obj.mapProperties) {
		let h = getHex(hp.hex)
		if (!h) continue		// (outside map. May happen on map-edges)
		if (hp.prop) h.prop = hp.prop
		if (hp.edges) h.edges = hp.edges
	}
}

export function getHex(hex) {
	const k = hex.x + hex.y * 1000
	return hexMap.get(k)
}
export function getAxial(ax) {
	const k = ax.q + 1000*ax.r
	return axMap.get(k)
}
export function removeUnit(u) {
	if (!u.hex) return
	let h = getHex(u.hex)
	delete u.hex
	if (h.units) h.units.delete(u)
}
export function addUnit(u, hex) {
	let h = getHex(hex)
	if (!h) return				// (off map?)
	u.hex = hex
	if (!h.units) h.units = new Set()
	h.units.add(u)
}
