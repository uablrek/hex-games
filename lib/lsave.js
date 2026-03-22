
// SPDX-License-Identifier: CC0-1.0.
/*
  Handle local save for:
  https://github.com/uablrek/hex-games
*/

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


