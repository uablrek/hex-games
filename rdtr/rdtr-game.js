// SPDX-License-Identifier: CC0-1.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
 */
import Konva from 'konva';
import * as rdtr from './rdtr.js';

// These will be included in the bundle
import sc1939 from './scenario-1939.json'
import sc1942 from './scenario-1942.json'
import sc1944 from './scenario-1944.json'
import scTEST from './scenario-test.json'

;(async () => {
	// The "await" here ensures that the map is displayed before we
	// continue. Otherwise the UnitBox shows up *before* the map. It
	// isn't wrong, but looks weird
	await rdtr.setStage('container')

	var href = new URL(location.href)
	let sc = href.searchParams.get("scenario");
	if (sc == "save") {
		if (typeof rdtrSaveData !== 'undefined') {
			rdtr.loadSave()
			rdtr.initUI()
		} else {
			alert("No save (rdtrSaveData.js) found")
		}
	} else {
		let scenario = sc1939
		if (sc) {
			switch (sc) {
			case "TEST":
				scenario = scTEST
			case "1939":
			case "Campaign":
			case "campaign":
				break
			case "1942":
				scenario = sc1942
				break
			case "1944":
				scenario = sc1944
				break
			default:
				alert(`Unknown scenario: ${sc}`)
			}
		}
		rdtr.loadScenario(scenario)
		rdtr.initUI()
	}
})()
