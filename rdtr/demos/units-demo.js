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
		x = (col * (side+10) * scale) + offsetX + 20
		y = (row * (side+10) * scale) + 80
		u.img.x(x)
		u.img.y(y)
		layer.add(u.img)
		if ((i % 10) == 0) {
			indexText(offsetX - 50, y - 13, `${i}`)
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
const nations = {
	ge: {color:'black',stroke:'white'},
	uk: {color:'#FAD449',stroke:'black'},
	it: {color:'#C1C7B1',stroke:'black'},
	fr: {color:'#76BFCB',stroke:'black'},
	us: {color:'#9F8E29',stroke:'black'},
	su: {color:'#AE8C29',stroke:'black'},
	iq: {color:'#327844',stroke:'white'},
	sp: {color:'#AF8D54',stroke:'white'},
	tu: {color:'#D5C085',stroke:'white'},
	nu: {color:'#996E2B',stroke:'white'},
	fi: {color:'#CBCBCB',stroke:'black'},
	hu: {color:'#CBCBCB',stroke:'black'},
	ru: {color:'#CBCBCB',stroke:'black'},
	bu: {color:'#CBCBCB',stroke:'black'},
}

// async main
;(async () => {
	await unit.init(layer)
	// Get the scenario given by "?scenario=0" in the url
	let href = new URL(location.href);
	let scenario = 0;
	let sc = href.searchParams.get("scenario");
	if (sc == "1") {
		byNation()
	} else if (sc == "2") {
		// Define .stat. In rdtr units has .s and .m
		for (const u of unit.units) {
			if ('s' in u) {
				if (u.m)
					u.stat = `${u.s}-${u.m}`
				else
					u.stat = `${u.s}`
			}
		}
		await genunit.init(unit.units, nations, 0.88, false)
		generatedUnits()
	} else {
		byIndex()
	}
})()
