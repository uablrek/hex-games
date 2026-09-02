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
	grid.configure(50, 1.02, {x:0,y:0}, true)
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
		draggable: true,
	})
	image.clear.cache()
	image.mud = new Konva.Image({
		image: res[1],
		draggable: true,
	})
	image.mud.cache()
	image.snow = new Konva.Image({
		image: res[2],
		draggable: true,
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
	hexGrid =  new Konva.Rect({
        width: width*60,
        height: height*50,
        fillPatternImage: pattern,
        fillPatternRepeat: 'repeat',
        fillPatternScale: grid.patternScale(),
		offsetX: 29,
    })
    hexGrid.cache()
	return 0
}

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
const maps = {
	map01: {data: map01},
	map02: {data: map02},
	map03: {data: map03},
	map04: {data: map04},
	map05: {data: map05},
	map06: {data: map06},
	map07: {data: map07},
	map08: {data: map08},
	map09: {data: map09},
	map10: {data: map10},
	map11: {data: map11},
	map12: {data: map12},
	map13: {data: map13},
	map14: {data: map14},
	map15: {data: map15},
	map16: {data: map16},
	map17: {data: map17},
	map18: {data: map18},
	map19: {data: map19},
	map20: {data: map20},
	map21: {data: map21},
	map22: {data: map22},
	map23: {data: map23},
	map24: {data: map24},
	map25: {data: map25},
	map26: {data: map26},
	map27: {data: map27},
	map28: {data: map28},
	map29: {data: map29},
	map30: {data: map30},
	map31: {data: map31},
	map32: {data: map32},
	map33: {data: map33},
	map34: {data: map34},
	map35: {data: map35},
	map36: {data: map36},
	map37: {data: map37},
	map38: {data: map38},
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
