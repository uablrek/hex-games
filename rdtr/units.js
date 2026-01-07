// SPDX-License-Identifier: CC0-1.0.
import Konva from 'konva';
import * as rdtr from './rdtr.js';

const scale = 0.4

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,	
});

const layer = new Konva.Layer()
stage.add(layer);

// Get the scenario given by "?scenario=0" in the url
var href = new URL(location.href);
var scenario = 0;
let sc = href.searchParams.get("scenario");
if (sc) {
	scenario = Number(sc)
}

// Show units by index
if (scenario == 0) {
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
	let maxRow = Math.round(rdtr.units.length / 20)
	for (const [i, u] of rdtr.units.entries()) {
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
if (scenario == 1) {
	stage.height(6000 * scale)
	side = 120
	document.body.style.background = 'gray'
	let row = 0, col = 0;
	for (let n of Object.values(rdtr.nat)) {
		for (let i of n) {
			let u = rdtr.units[i];
			u.img.x((col * (side+10) * scale + 40));
			u.img.y((row * (side+10) * scale + 40));
			layer.add(u.img);
			if (++col > 16) { row++; col = 0; }
		}
		col = 0; row++;
	}
}
