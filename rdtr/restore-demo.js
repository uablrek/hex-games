// SPDX-License-Identifier: CC0-1.0.
/*
  Restore a previously stored deployment
 */
import Konva from 'konva';
import * as rdtr from './rdtr.js';
import * as unit from './units.js';

rdtr.setStage('container')

unit.unselectAll()
let save = require('./test-deployment.json')
if (save.version > 1) {
	alert(`Version not supported ${save.version}`)
} else {
	rdtr.deploy(save.deployment.units)
}
