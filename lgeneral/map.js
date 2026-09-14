// SPDX-License-Identifier: CC-BY-4.0.
/*
  Handles maps for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/

import Konva from 'konva'
import {grid, map} from '@uablrek/hex-games'
import * as terrain from './terrain.js'
const dbg = console.log

export let image = {}
export let hexGrid

export async function init(mapName) {
	if (!(mapName in maps)) return -1
	await terrain.init()
	const m = maps[mapName]
	// Check data
	const nTiles = m.data.tiles.length
	const width = m.data.width
	const height = m.data.height
	if (nTiles != (width*height)) {
		throw new Error(`Map data mismatch ${width}x${height} != ${nTiles}`)
		return
	}
	// Configure the grid. Do this before any other grid operations!
	grid.configure(50, 1.02, {x:-14,y:-25}, true)
	// Build mapProperties and map groups
	const mprop = new Array(nTiles)
	const gClear = new Konva.Group()
	const gMud = new Konva.Group()
	const gSnow = new Konva.Group()
	let y = 0, x = 0
	for (const [i,t] of m.data.tiles.entries()) {
		const mt = tcode.get(t.charAt(0))
		const s = Number(t.substring(1))
		mprop[i] = {
			hex: {x:x, y:y},
			terrain: mt,
			name: m.data.names[i],
		}
		const pos = grid.hexToPixel({x:x, y:y})
		gClear.add(terrain.tdata.get(mt).tile[s].clone({
			position: pos,
		}))
		gMud.add(terrain.tdata.get(mt + "_rain").tile[s].clone({
			position: pos,
		}))
		gSnow.add(terrain.tdata.get(mt + "_snow").tile[s].clone({
			position: pos,
		}))
		// next hex
		x++
		if (x == width) {
			y++
			x = 0
		}
	}
	// Create images for the maps. Do this in parallel
	const p = [
		gClear.toImage(),
		gMud.toImage(),
		gSnow.toImage(),
	]
	const res = await Promise.all(p)
	// Store Konva.Images for clear, mud and snow maps. Cache for performance
	image.clear = new Konva.Image({
		image: res[0],
	})
	image.clear.cache()
	image.mud = new Konva.Image({
		image: res[1],
	})
	image.mud.cache()
	image.snow = new Konva.Image({
		image: res[2],
	})
	image.snow.cache()
	// Init the map
	map.init({
		width: width,
		height: height,
		mapProperties: mprop,
	})
	// Build the grid
    const pattern = new Image()
    pattern.src = grid.patternSvg("gray")
    await new Promise(resolve => pattern.onload = resolve)
	hexGrid = new Konva.Group()
	hexGrid.add(new Konva.Rect({
        width: width*43.8 + 60,
        height: height*50,
        fillPatternImage: pattern,
        fillPatternRepeat: 'repeat',
        fillPatternScale: grid.patternScale(),
		offsetX: 29,
    }))
    hexGrid.cache()
	return 0
}
// Get the hex object from a pointer position
let currentHex = {x:-10,y:-10}
let currentHexObject = null
export function hexFromPointer(pos) {
	const hex = grid.pixelToHex(pos)
	if (hex.x != currentHex.x || hex.y != currentHex.y) {
		//dbg(hex)
		currentHex = hex
		currentHexObject = map.getHex(currentHex)
	}
	return currentHexObject
}

// Re-export some map functions
export const getHex = map.getHex

// ----------------------------------------------------------------------
// Map data
import map01 from './map01.json'
import map02 from './map02.json'
import map03 from './map03.json'
import map04 from './map04.json'
import map05 from './map05.json'
import map06 from './map06.json'
import map07 from './map07.json'
import map08 from './map08.json'
import map09 from './map09.json'
import map10 from './map10.json'
import map11 from './map11.json'
import map12 from './map12.json'
import map13 from './map13.json'
import map14 from './map14.json'
import map15 from './map15.json'
import map16 from './map16.json'
import map17 from './map17.json'
import map18 from './map18.json'
import map19 from './map19.json'
import map20 from './map20.json'
import map21 from './map21.json'
import map22 from './map22.json'
import map23 from './map23.json'
import map24 from './map24.json'
import map25 from './map25.json'
import map26 from './map26.json'
import map27 from './map27.json'
import map28 from './map28.json'
import map29 from './map29.json'
import map30 from './map30.json'
import map31 from './map31.json'
import map32 from './map32.json'
import map33 from './map33.json'
import map34 from './map34.json'
import map35 from './map35.json'
import map36 from './map36.json'
import map37 from './map37.json'
import map38 from './map38.json'
export const maps = {
	map01: {data: map01, name: "Poland"},
	map02: {data: map02, name: "Warsaw"},
	map03: {data: map03, name: "Norway"},
	map04: {data: map04, name: "LowCountries"},
	map05: {data: map05, name: "France"},
	map06: {data: map06, name: "Sealion40"},
	map07: {data: map07, name: "NorthAfrica"},
	map08: {data: map08, name: "MiddleEast"},
	map09: {data: map09, name: "ElAlamein"},
	map10: {data: map10, name: "Caucasus"},
	map11: {data: map11, name: "Sealion43"},
	map12: {data: map12, name: "Torch"},
	map13: {data: map13, name: "Husky"},
	map14: {data: map14, name: "Anzio"},
	map15: {data: map15, name: "D-Day"},
	map16: {data: map16, name: "Anvil"},
	map17: {data: map17, name: "Ardennes"},
	map18: {data: map18, name: "Cobra"},
	map19: {data: map19, name: "MarketGarden"},
	map20: {data: map20, name: "BerlinWest"},
	map21: {data: map21, name: "Balkans"},
	map22: {data: map22, name: "Crete"},
	map23: {data: map23, name: "Barbarossa"},
	map24: {data: map24, name: "Kiev"},
	map25: {data: map25, name: "Moscow41"},
	map26: {data: map26, name: "Sevastapol"},
	map27: {data: map27, name: "Moscow42"},
	map28: {data: map28, name: "Stalingrad"},
	map29: {data: map29, name: "Kharkov"},
	map30: {data: map30, name: "Kursk"},
	map31: {data: map31, name: "Moscow43"},
	map32: {data: map32, name: "Byelorussia"},
	map33: {data: map33, name: "Budapest"},
	map34: {data: map34, name: "BerlinEast"},
	map35: {data: map35, name: "Berlin"},
	map36: {data: map36, name: "Washington"},
	map37: {data: map37, name: "EarlyMoscow"},
	map38: {data: map38, name: "SealionPlus"},
}
const tcode = new Map([
	["c", "clear"],
	["r", "road"],
	["b", "bridge"],
	["#", "fields"],
	["~", "rough"],
	["R", "river"],
	["f", "forest"],
	["F", "fort"],
	["a", "airfield"],
	["t", "town"],
	["o", "ocean"],
	["m", "mountain"],
	["s", "swamp"],
	["d", "desert"],
	["D", "rough_desert"],
	["h", "harbor"],
])
