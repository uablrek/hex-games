// SPDX-License-Identifier: CC0-1.0.
/*
  This is the images module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr

  When images are not used, e.g. in unit-test, or on a server,
  this is replaced with dummy functions
*/

import mapImageData from './rdtr-map.png'
import combatChartData from './rdtr-combat-chart.png'

export async function map() {
	const img = new Image()
	img.src = mapImageData
	await new Promise(resolve => img.onload = resolve)
	return new Konva.Image({
		image: img,
	})
}

export async function crt() {
	const img = new Image()
	img.src = combatChartData
	await new Promise(resolve => img.onload = resolve)
	return new Konva.Image({
		image: img,
	})
}

