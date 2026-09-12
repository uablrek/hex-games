// SPDX-License-Identifier: CC-BY-4.0.
/*
  Handles scenarios for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/

import * as map from './map.js'

export let sc

export async function init(scenarioName) {
	if (!scenarios.has(scenarioName)) return -1
	sc = scenarios.get(scenarioName)
	if (await map.init(sc.data.map)) return -1
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
import marketgarden from './market_garden.json'
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
import sevastopol from './sevastopol.json'
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
