// SPDX-License-Identifier: CC0-1.0.
/*
  Restore a previously stored deployment
 */
import Konva from 'konva';
import * as rdtr from './rdtr.js';

rdtr.setStage('container')

rdtr.unitUnselectAll()
let save = require('./test-deployment.json')
if (save.version > 2) {
	alert(`Version not supported ${save.version}`)
} else {
	rdtr.deploy(save.deployment.units)
}
