// SPDX-License-Identifier: CC0-1.0.
/*
  This shows an informational text-box for:
  https://github.com/uablrek/hex-games/
*/

import Konva from 'konva'

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
export function setStrokeX(x, stroke) {
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
	// "e" is some node in a Konva.Group that represents a button. A
	// close button "X", in case of an infobox, or a labelled button
	// for a choicebox.
	let button = e.target.findAncestor('Group')
	let me = e.target.findAncestor('.infobox')
	if (callback) {
		// Return "true" prevents destroy. Return "false", or nothing
		// (undefined) destroys the box
		if (callback(me, button)) return
	}
	me.destroy()
}

// Return a text info-box (Konva.Group) with a close button
export function info(obj = {}) {
	let conf = {
		x: 400,
		y: 300,
		text: "",
		label: "Info",
		fontSize: 18,
		fill: 'black',
		stroke: 'gold',
		lineHeight: 1.2,
		textColour: 'white',
		destroyable: true,
	}
	for (const prop in obj) conf[prop] = obj[prop]
	let textObj = new Konva.Text({
		x: 25,
		y: 45,
		fontSize: conf.fontSize,
		lineHeight: conf.lineHeight,
		fill: conf.textColour,
		text: conf.text,
		name: "text",
	})
	if (obj.width) textObj.width(obj.width - 50)
	if (obj.fontFamily) textObj.fontFamily(obj.fontFamily)
	const width = obj.width ? obj.width : textObj.width() + 50
	const height = obj.height ? obj.height : textObj.height() + 60
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
		name: "rect",
	}))
	if (conf.destroyable) {
		const close = X.clone({
			x: width - 40,
			y: 15,
			name: "X",
		})
		setStrokeX(close, conf.stroke)
		box.add(close)
		close.on('click', destroyParent)
	}
	box.add(new Konva.Text({
		x: 25,
		y: 15,
		fontSize: 22,
		fill: conf.stroke,
		text: conf.label,
	}))
	box.add(textObj)
	return box
}

export function update(box, txt) {
	let txtObj = box.findOne('.text')
	if (txtObj) txtObj.text(txt)
}

export function choice(obj = {}) {
	obj.destroyable = false
	let infobox = info(obj)
	let conf = {
		fill: 'white',
		choices: ['OK'],
		text: "Hello, world"
	}
	for (const prop in obj) conf[prop] = obj[prop]
	const buttons = choiceButtons(conf.choices, conf.fill)
	const bheight = buttons[0].findOne('.rect').height()
	const bwidth = buttons[0].findOne('.rect').width()
	// Enlarge the infobox to hold the row of buttons
	const r = infobox.findOne('.rect')
	const iheight = r.height()
	r.height(iheight + bheight + 16)
	const rowwidth = (bwidth+10)*buttons.length - 10
	if (r.width() < rowwidth) r.width(rowwidth)
	let x = (r.width() - rowwidth) / 2 + 4
	let y = iheight + 4
	for (const b of buttons) {
		b.x(x)
		b.y(y)
		infobox.add(b)
		x += (bwidth + 10)
	}
	return infobox
}
function choiceButtons(labels, fill) {
	if (labels.length == 0) return []
	const klabels = []			// Labels as Konva.Text objects
	for (const l of labels) {
		klabels.push(new Konva.Text({
			text: l,
			fontFamily: 'sans-serif',
			fontSize: 20,
			align: 'center',
			verticalAlign: 'middle',
			fill: fill,
		}))
	}
	const buttons = []
	let height = klabels[0].height() + 8
	let width = 0
	// Find the largest text-width
	for (const kl of klabels)
		if (kl.width() > width) width = kl.width()
	width += 16
	for (const kl of klabels) {
		const b = new Konva.Group({
			name: kl.text(),
		})
		b.add(new Konva.Rect({
			x:0,
			y:0,
			height: height,
			width: width,
			name: 'rect',
			stroke: fill,
		}))
		kl.height(height)
		kl.width(width)
		b.add(kl)
		b.on('click', destroyParent)
		buttons.push(b)
	}
	return buttons
}
