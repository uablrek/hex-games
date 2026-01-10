// SPDX-License-Identifier: CC0-1.0.
/*
  This is the main module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
 */
import Konva from 'konva';
import * as rdtr from './rdtr.js';

rdtr.setStage('container')

// Since we use "require", these will be included in the bundle
let sc1939 = require('./scenario-1939.json')
let sc1944 = require('./scenario-1944.json')

if (typeof rdtrSaveData !== 'undefined') {
	rdtr.loadSave()
} else {
	let scenario = sc1939
	var href = new URL(location.href)
	let sc = href.searchParams.get("scenario");
	if (sc) {
		switch (sc) {
		case "1939":
		case "Campaign":
		case "campaign":
			break
		case "1944":
			scenario = sc1944
			break
		default:
			alert(`Unknown scenario: ${sc}`)
		}
	}
	rdtr.loadScenario(scenario)
}
