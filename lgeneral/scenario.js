// SPDX-License-Identifier: CC-BY-4.0.
/*
  Handles scenarios for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/

import Konva from 'konva'
import {grid} from '@uablrek/hex-games'
import * as map from './map.js'
let dbg = console.log

export let sc

export async function init(scenarioName) {
	if (!scenarios.has(scenarioName)) return -1
	sc = scenarios.get(scenarioName)
	// the map is prefixed with "pg/"
	if (await map.init(sc.data.map.substring(3))) return -1
	// Crop flags from the flag-image (1x24 flags)
	const flagsImg = new Image()
	flagsImg.src = flag_data
	await new Promise(resolve => flagsImg.onload = resolve)
	for (const n of Object.values(nation)) {
		n.flag = new Konva.Image({
			crop: {
				x: 0,
				y: n.id * 13,
				width: 20,
				height: 13,
			},
			height: 13,
			image: flagsImg,
		})
	}
	// Place flags on the grid
	for (const t of sc.data.flags) {
		const n = nation[t.nation]
		const f = new Konva.Group()
		if (t.obj) {
			// Add a frame to objects
			f.add(new Konva.Rect({
				width: 22,
				height: 15,
				stroke: 'yellow',
			}))
			f.add(n.flag.clone({
				x: 1,
				y: 1,
			}))
			f.offset({x:9,y:5.5})
		} else {
			f.add(n.flag.clone())
			f.offset({x:10,y:6.5})
		}
		const pos = grid.hexToPixel({x:t.x,y:t.y})
		f.position({x:pos.x, y:pos.y+15})
		map.hexGrid.add(f)
	}
	map.hexGrid.cache()			// re-cache with flags
	return 0
}


// ----------------------------------------------------------------------
// Data

import flag_data from './flags.png'
import anvil from './anvil.json'
import anzio from './anzio.json'
import ardennes from './ardennes.json'
import balkans from './balkans.json'
import barbarossa from './barbarossa.json'
import berlin from './berlin.json'
import berlineast from './berlineast.json'
import berlinwest from './berlinwest.json'
import budapest from './budapest.json'
import byelorussia from './byelorussia.json'
import caucasus from './caucasus.json'
import cobra from './cobra.json'
import crete from './crete.json'
import d_day from './d_day.json'
import earlymoscow from './earlymoscow.json'
import elalamein from './elalamein.json'
import france from './france.json'
import husky from './husky.json'
import kharkov from './kharkov.json'
import kiev from './kiev.json'
import kursk from './kursk.json'
import lowcountries from './lowcountries.json'
import marketgarden from './marketgarden.json'
import middleeast from './middleeast.json'
import moscow41 from './moscow41.json'
import moscow42 from './moscow42.json'
import moscow43 from './moscow43.json'
import northafrica from './northafrica.json'
import norway from './norway.json'
import poland from './poland.json'
import sealion40 from './sealion40.json'
import sealion43 from './sealion43.json'
import sealionplus from './sealionplus.json'
import sevastopol from './sevastapol.json'
import stalingrad from './stalingrad.json'
import torch from './torch.json'
import warsaw from './warsaw.json'
import washington from './washington.json'

const scenarios = new Map([
	['Anvil', {data: anvil}],
	['Anzio', {data: anzio}],
	['Ardennes', {data: ardennes}],
	['Balkans', {data: balkans}],
	['Barbarossa', {data: barbarossa}],
	['Berlin', {data: berlin}],
	['BerlinEast', {data: berlineast}],
	['BerlinWest', {data: berlinwest}],
	['Budapest', {data: budapest}],
	['Byelorussia', {data: byelorussia}],
	['Caucasus', {data: caucasus}],
	['Cobra', {data: cobra}],
	['Crete', {data: crete}],
	['D-Day', {data: d_day}],
	['EarlyMoscow', {data: earlymoscow}],
	['ElAlamein', {data: elalamein}],
	['France', {data: france}],
	['Husky', {data: husky}],
	['Kharkov', {data: kharkov}],
	['Kiev', {data: kiev}],
	['Kursk', {data: kursk}],
	['LowCountries', {data: lowcountries}],
	['MarketGarden', {data: marketgarden}],
	['MiddleEast', {data: middleeast}],
	['Moscow41', {data: moscow41}],
	['Moscow42', {data: moscow42}],
	['Moscow43', {data: moscow43}],
	['NorthAfrica', {data: northafrica}],
	['Norway', {data: norway}],
	['Poland', {data: poland}],
	['Sealion40', {data: sealion40}],
	['Sealion43', {data: sealion43}],
	['SealionPlus', {data: sealionplus}],
	['Sevastopol', {data: sevastopol}],
	['Stalingrad', {data: stalingrad}],
	['Torch', {data: torch}],
	['Warsaw', {data: warsaw}],
	['Washington', {data: washington}],
])

export const nation = {
    aus: { name:"Austria", id: 0},
    bel: { name:"Belgia", id: 1},
    bul: { name:"Bulgaria", id: 2},
    lux: { name:"Luxemburg", id: 3},
    den: { name:"Denmark", id: 4},
    fin: { name:"Finnland", id: 5},
    fra: { name:"France", id: 6},
    ger: { name:"Germany", id: 7},
    gre: { name:"Greece", id: 8},
    usa: { name:"USA", id: 9},
    hun: { name:"Hungary", id: 10},
    tur: { name:"Turkey", id: 11},
    it:  { name:"Italy", id: 12},
    net: { name:"Netherlands", id: 13},
    nor: { name:"Norway", id: 14},
    pol: { name:"Poland", id: 15},
    por: { name:"Portugal", id: 16},
    rum: { name:"Rumania", id: 17},
    esp: { name:"Spain", id: 18},
    so:  { name:"Sovjetunion", id: 19},
    swe: { name:"Sweden", id: 20},
    swi: { name:"Switzerland", id: 21},
    eng: { name:"Great Bitain", id: 22},
    yug: { name:"Yugoslavia", id: 23}
}
