// SPDX-License-Identifier: CC0-1.0.
/*
  This shows an informational text-box for:
  https://github.com/uablrek/hex-games/
*/

import Konva from 'konva'

// A traditional "close" button
const X = new Image()
X.src = "data:image\/svg+xml,<svg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" xmlns=\"http://www.w3.org/2000/svg\"> <rect x=\"2\" y=\"2\" width=\"76\" height=\"76\" fill=\"none\" stroke=\"white\" stroke-width=\"4\"/> <path d=\"M 15 15 L 65 65 M 15 65 L 65 15\" stroke=\"white\" stroke-width=\"10\" fill=\"none\"/> </svg>"

var callback
export function destroyCallback(fn) {
	callback = fn
}

function moveToTop(e) {
	e.target.moveToTop()
}
function destroyParent(e) {
	if (callback) callback(e.target.parent)
	e.target.parent.destroy()
}
export function info(label, text, obj = {}) {
	// Honour the obj, but enforce x,y,text
	let conf = {
		fontSize: 18,
		fill: 'white',
		lineHeight: 1.2,
	}
	for (var prop in obj) conf[prop] = obj[prop]
	conf.x = 25
	conf.y = 45
	conf.text = text
	conf.name = "text"
	let textObj = new Konva.Text(conf)
	let width = textObj.width() + 50
	let height = textObj.height() + 60
	if (!obj.x) obj.x = 400
	if (!obj.y) obj.y = 300
	let box = new Konva.Group({
		draggable: true,
		x: obj.x,
		y: obj.y,
	})
	box.on('dragstart', moveToTop)
	box.add(new Konva.Rect({
		x: 0,
		y: 0,
		width: width,
		height: height,
		fill: 'black',
		stroke: 'gold',
		strokeWidth: 4,
		cornerRadius: 20,
	}))
	let close = new Konva.Image({
		x: width - 40,
		y: 15,
		image: X,
		scale: {x:0.3,y:0.3},
	})
	box.add(close)
	close.on('click', destroyParent)
	box.add(new Konva.Text({
		x: 25,
		y: 15,
		fontSize: 22,
		fill: 'gold',
		text: label,
	}))
	box.add(textObj)
	return box
}

