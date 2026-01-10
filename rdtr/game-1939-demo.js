// SPDX-License-Identifier: CC0-1.0.
import Konva from 'konva';
import * as rdtr from './rdtr.js';

rdtr.setStage('container')

let scenario = require('./scenario-1939.json')
if (typeof rdtrSaveData !== 'undefined') {
	rdtr.loadSave()
} else {
	rdtr.loadScenario(scenario)
}
