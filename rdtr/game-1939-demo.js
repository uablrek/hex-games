// SPDX-License-Identifier: CC0-1.0.
import Konva from 'konva';
import * as rdtr from './rdtr.js';
import * as unit from './units.js';

rdtr.setStage('container')

rdtr.stage.container().tabIndex = 1
rdtr.stage.container().focus();
rdtr.stage.container().addEventListener("keydown", (e) => {
	if (!e.repeat) {
		if (e.key == "S") {
			rdtr.saveGame()
		}
	}
});

let scenario = require('./game-1939.json')
if (typeof rdtrSaveData !== 'undefined') {
	rdtr.loadSave()
} else {
	rdtr.loadScenario(scenario)
}
