// SPDX-License-Identifier: CC0-1.0.

import Konva from 'konva'
import {grid} from '@uablrek/hex-games'
import * as map from './map.js'
import {board, sc, g} from './main.js'
import {shipClasses} from './tables.js'
import solData from './sol.svg'
import brflagData from './gb.svg'
import frflagData from './fr.svg'
import spflagData from './es.svg'

const shipImage = {}
const flagImage = {}
const shipClass = new Map()
let scale = 1.0
let ships
let classData

export function fromImg(img) {
	// Since s.img is a Konva.Group, the clicked item may be anything in it
	let g = img.findAncestor('Group', true)
	i = Number(g.id().substring(4))
    return ships[i]
}

const markerTemplate = new Konva.Rect({
	height: 115,
	width: 60,
	stroke: "gold",
	strokeWidth: 3,
	offsetX: 26,
	offsetY: 28,
	cornerRadius: 3,
})
export function mark(s, map) {
	const pos = grid.hexToPixel({x:s.hex.x, y:s.hex.y})
	s.mark = markerTemplate.clone({
		position: pos,
	})
	s.mark.rotation((s.d - 1) * 60)
	map.add(s.mark)
}
export function unmark(s) {
	if (s.mark) {
		s.mark.destroy()
		s.mark = null
	}
}
export function place(s) {
	if (!s.ih) return
	const hex = map.idToHex(s.ih.hex)
	s.img.position(grid.hexToPixel(hex))
	s.img.rotation((s.ih.d - 1) * 60)
	s.hex = hex
	s.d = s.ih.d
	board.add(s.img)
}
export function move(s, i) {
	if (!s.m) return
	const m = s.m.charAt(i)
	if (!m) return
	switch (m) {
	case 'L':
		break
	case 'R':
		break
	case '1':
		break
	}
}
const mAspect = {
	b3: {
		A: 3,
		B: 2,
		C: 1,
		D: 0,
	},
	b4: {
		A: 4,
		B: 3,
		C: 1,
		D: 0,
	},
	f5: {
		A: 5,
		B: 4,
		C: 2,
		D: 0,
	},
	f6: {
		A: 6,
		B: 5,
		C: 2,
		D: 0,
	},
	f7: {
		A: 7,
		B: 6,
		C: 2,
		D: 0,
	},	
}
function defineMovementAllowance(s) {
	switch (s.class) {
	case "SOL1":
		s.mov = {
			turn: 1,
			battle: mAspect.b3,
			full: mAspect.f5,
		}
		break
	case "SOL2":
		s.mov = {
			turn: 2,
			battle: mAspect.b3,
			full: mAspect.f5,
		}
		break
	}
}
// Returns a Konva.Group (ii = image identifier)
function createShipImg(s, i) {
	const img = new Konva.Group({
		id: `ship${i}`,
	})
	img.add(new Konva.Image({
		image: shipImage[s.ii],
		scale: {x: 0.55, y: 0.55},
		offsetX: 37,
		offsetY: 38,
	}))
	if (s.name) {
		const txt = new Konva.Text({
			fontFamily: "sans-serif",
			fontSize: 12,
			text: s.name,
			position: {x:20,y:30},
			fill: 'yellow',
		})
		txt.offsetX(txt.width()/2)
		txt.rotate(-90)
		img.add(txt)
	}
	if (s.nat in flagImage) {
		const flag = new Konva.Image({
			image: flagImage[s.nat],
			scale: {x: 0.05, y: 0.05},
			position: {x:8,y:82},
		})
		flag.rotate(-90)
		img.add(flag)
	}
	s.img = img
}
async function loadImage(data) {
	const img = new Image()
	img.src = data
	await new Promise(resolve => img.onload = resolve)
	return img
}

const cqI = {
	El: 0,
	Cr: 1,
	Av: 2,
	Gr: 3,
	Po: 4,
}
export async function init(_ships, _scale = 1.0) {
	scale = _scale
	ships = _ships
	// Load and await images
	shipImage.sol = await loadImage(solData)
	flagImage.br = await loadImage(brflagData)
	flagImage.fr = await loadImage(frflagData)
	flagImage.sp = await loadImage(spflagData)
	// Create a ship-class Map
	if (sc.classTable)
		classData = shipClasses[sc.classTable]
	else
		classData = shipClasses["ah_napoleonic"]
	for (const c of classData) shipClass.set(c.cid, c)
	// Fill in ship data
	for (const [i, s] of ships.entries()) {
		s.i = i
		// Ship data *may* define everything *or* use a pre-defined
		// class-id (cid), and optionally override some stats
		if (shipClass.has(s.cid)) {
			const c = shipClass.get(s.cid)
			for (const prop in c) {
				if (prop == "cid" || prop == "pv") continue
				if (!(prop in s)) s[prop] = c[prop]
			}
			if (!("pv" in s)) s.pv = c.pv[cqI[s.cq]]
		}
		createShipImg(s, i)
		s.img.cache()			// pre-render ships
		defineMovementAllowance(s)
		// Stats. These will change over the battle
		s.s = {
			hull: s.hull,
			guns: {l:s.guns, r:s.guns},
			crew: s.crew.split('-'),
			rigg: s.rigging.split('-'),
		}
		if (s.car) s.s.car = {l:s.car, r:s.car}
	}
}
