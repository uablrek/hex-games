// SPDX-License-Identifier: CC0-1.0.
import Konva from 'konva';
import * as unit from './rdtr-unit.js';
import * as genunit from './units.js'

const scale = 0.4

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,	
});

const layer = new Konva.Layer()
stage.add(layer);

// Show units by index
function byIndex() {
	function indexText(x, y, txt) {
		layer.add(new Konva.Text({
			x: x,
			y: y,
			text: txt,
			fontSize: 18,
		}))
	}
	stage.height(6000 * scale)
	side = 120
	document.body.style.background = 'gray'
	let row = 0, col = 0, offsetX = 80;
	let maxRow = Math.round(unit.units.length / 20)
	for (const [i, u] of unit.units.entries()) {
		x = (col * (side+10) * scale) + offsetX
		y = (row * (side+10) * scale) + 40
		if ((i % 10) == 0) {
			indexText(offsetX - 50, y + 15, `${i}`)
		}
		u.img.x(x)
		u.img.y(y)
		layer.add(u.img)
		col++
		if (col >= 10) {
			row++
			col = 0
			if (row > maxRow) {
				row = 0
				offsetX += 600
			}
		}
	}
}

// Show units by nation
function byNation() {
	stage.height(6000 * scale)
	side = 120
	document.body.style.background = 'gray'
	// Sort units on nationality
	var nat = {}
	for (let u of unit.units) {
		if (!nat[u.nat]) nat[u.nat] = []
		nat[u.nat].push(u);
	}
	// Display them by nation
	let row = 0, col = 0
	for (const n in nat) {
		for (u of nat[n]) {
			u.img.x((col * (side+10) * scale + 40));
			u.img.y((row * (side+10) * scale + 40));
			layer.add(u.img);
			if (++col > 16) { row++; col = 0; }
		}
		col = 0; row++;
	}
}

function generatedUnits() {
	const ucolors = {
		ge: ['black','white'],
		uk: ['#FAD449','black'],
		it: ['#C1C7B1','black'],
		fr: ['#76BFCB','black'],
		us: ['#9F8E29','black'],
		su: ['#AE8C29','black'],
		iq: ['#327844','white'],
		sp: ['#AF8D54','white'],
		tu: ['#D5C085','white'],
		nu: ['#996E2B','white'],
		fi: ['#CBCBCB','black'],
		hu: ['#CBCBCB','black'],
		ru: ['#CBCBCB','black'],
		bu: ['#CBCBCB','black'],
	}
	function indexText(x, y, txt) {
		layer.add(new Konva.Text({
			x: x,
			y: y,
			text: txt,
			fontSize: 18,
		}))
	}
	stage.height(6000 * scale)
	side = 120
	document.body.style.background = 'gray'
	let row = 0, col = 0, offsetX = 80
	let maxRow = Math.round(unit.units.length / 20)
	for (const [i, u] of unit.units.entries()) {
		x = (col * (side+10) * scale) + offsetX
		y = (row * (side+10) * scale) + 40
		if (u.nat in ucolors &&
			['inf','pz','res','air','ab','nav','mec','par'].includes(u.type)) {
			let stat, lbl=''
			if (u.m)
				stat = `${u.s}-${u.m}`
			else
				stat = `${u.s}`
			if (u.lbl) lbl = u.lbl
			let gu = genunit.createUnit(ucolors[u.nat][0],ucolors[u.nat][1],u.type,stat,'',lbl)
			gu.position({x:x+27,y:y+27})
			layer.add(gu)
		}
		if ((i % 10) == 0) {
			indexText(offsetX - 50, y + 15, `${i}`)
		}
		col++
		if (col >= 10) {
			row++
			col = 0
			if (row > maxRow) {
				row = 0
				offsetX += 600
			}
		}
	}
}

// async main
;(async () => {
	await unit.init(layer)
	await genunit.init(0.92)
	// Get the scenario given by "?scenario=0" in the url
	let href = new URL(location.href);
	let scenario = 0;
	let sc = href.searchParams.get("scenario");
	if (sc == "1") {
		byNation()
	} else if (sc == "2") {
		generatedUnits()
	} else {
		byIndex()
	}
})()
