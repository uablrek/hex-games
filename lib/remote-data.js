
// SPDX-License-Identifier: CC0-1.0.
/*
  Handle remote data (save/restore) for
  https://github.com/uablrek/hex-games
*/

import * as unit from './units.js'

// Initiate a download
export function download(blob, name) {
	const fileURL = URL.createObjectURL(blob)
	const downloadLink = document.createElement('a')
	downloadLink.href = fileURL
	downloadLink.download = name
	document.body.appendChild(downloadLink)
	downloadLink.click()
	URL.revokeObjectURL(fileURL)
}
// Save game as a javascript variable. "name" WITHOUT .js
export function saveGame(game, name) {
	const json = JSON.stringify(game)
	const js = `const ${name} = '${json}'`
	const blob = new Blob([js], { type: 'text/javascript' });
	download(blob, name + '.js')
}
// Save object as JSON
export function saveJSON(obj, name) {
	const json = JSON.stringify(obj)
	const blob = new Blob([json], { type: 'application/json' })
	download(blob, name)
}

// Returns an array of all units with .hex defined.
// The array contains stringified units and offset coordinates.
// The array is sorted so more generic units comes last,
// e.g. "ge,inf,3-3,,Alp" comes before "ge,inf,3-3,,"
export function getDeplyment(units) {
	let ua = []
	for (const u of units) {
		if (!u.hex) continue
		ua.push({u: unit.toStr(u), hex: u.hex, i:u.i})
	}
	// TODO: check that a string-sort is enough. It probably isn't,
	//  but the developer should choose sensible units
	function cmp(a, b) {
		if (a.u == b.u) return 0
		if (a.u < b.u) return 1
		return -1
	}
	return ua.sort(cmp)
}

/*
export function deploy(units, filterOut) {
	let notFound = []
	for (const ud of units) {
		let u = unit.fromStr(ud.u, filterOut)
		if (!u) {
			notFound.push(ud.u)
			continue
		}
		unit.placeRdtr(u, ud.hex)
	}
	if (notFound.length) {
		console.log(`Not found: ${notFound}`)
		return false
	}
	return true
}
*/
