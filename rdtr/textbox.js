// SPDX-License-Identifier: CC0-1.0.
/*
  This shows an informational text-box for:
  https://github.com/uablrek/hex-games/
*/

import Konva from 'konva'

// Enable testing with node.js
var newImage = function() { return new Image() }
if (localStorage.getItem("nodejsTest") == "yes") {
	newImage = function() { return {} }
}

// A traditional "close" button
export const X = new Konva.Group({scale: {x:0.3,y:0.3}})
X.add(new Konva.Rect({
	x: 2,
	y: 2,
	width: 76,
	height: 76,
	strokeWidth: 4,
}))
X.add(new Konva.Path({
	data: "M 15 15 L 65 65 M 15 65 L 65 15",
	strokeWidth:10,
}))
function setStrokeX(x, stroke) {
	for (const c of x.getChildren()) c.stroke(stroke)
}

var callback
export function destroyCallback(fn) {
	callback = fn
}

function moveToTop(e) {
	e.target.moveToTop()
}
function destroyParent(e) {
	let me = e.target.findAncestor('.infobox')
	if (callback) callback(me)
	me.destroy()
}

// Return a text info-box (Konva.Group) with a close button
export function info(label, text, obj = {}) {
	let conf = {
		x: 400,
		y: 300,
		fontSize: 18,
		fill: 'black',
		stroke: 'gold',
		lineHeight: 1.2,
		textColour: 'white',
	}
	for (const prop in obj) conf[prop] = obj[prop]
	let textObj = new Konva.Text({
		x: 25,
		y: 45,
		fontSize: conf.fontSize,
		lineHeight: conf.lineHeight,
		fill: conf.textColour,
		text: text,
		name: "text",
	})
	const width = textObj.width() + 50
	const height = textObj.height() + 60
	let box = new Konva.Group({
		draggable: true,
		x: conf.x,
		y: conf.y,
		name: 'infobox',
	})
	box.on('dragstart', moveToTop)
	box.add(new Konva.Rect({
		x: 0,
		y: 0,
		width: width,
		height: height,
		fill: conf.fill,
		stroke: conf.stroke,
		strokeWidth: 4,
		cornerRadius: 20,
	}))
	const close = X.clone({
		x: width - 40,
		y: 15,
	})
	setStrokeX(close, conf.stroke)
	box.add(close)
	close.on('click', destroyParent)
	box.add(new Konva.Text({
		x: 25,
		y: 15,
		fontSize: 22,
		fill: conf.stroke,
		text: label,
	}))
	box.add(textObj)
	return box
}
