/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Some code taken from:
 * From http://www.redblobgames.com/maps/mapgen2/
 * Copyright 2017 Red Blob Games <redblobgames@gmail.com>
 * (also Apache License, Version 2.0)
 */

let defaultUiState = {
	sx: 40,
	sy: 20,
	h: 12,
	width: 6,
	height: 10
};

let uiState = {};
Object.assign(uiState, defaultUiState);

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

function draw_clear() {
	console.log(`Clear Canvas`);
	ctx.resetTransform();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw_grid() {
	console.log(`Draw grid`);
	let grid = new Path2D()
	draw_hex_grid(grid, uiState.width, uiState.height, uiState.sx, uiState.sy, uiState.h);
	ctx.translate(10, 10);		// add some margin
	ctx.lineWidth = 0.5;
	ctx.stroke(grid);
}

function draw_hex_grid(path, width, height, sx, sy, h) {
	const d = (sx - h) * 2;
	const hex = new Path2D(`m ${-sx} 0 l ${h} ${-sy} ${d} 0 ${h} ${sy} ${-h} ${sy} ${-d} 0 z`);
	const dx = 2 * sx + d;
	let matrix = new DOMMatrix()
	for (let y = 0; y < height; y++) {
		// Number of hexes on the (half-)row
		const nx = Math.ceil((width - (y & 1))/2);
		const offset = (y & 1) * dx/2;	// Odd lines are offset with dx/2
		for (let x = 0; x < nx; x++) {
			matrix.e = sx + dx*x + offset;
			matrix.f = sy + sy*y;
			path.addPath(hex, matrix);
		}
	}
}


// ----------------------------------------------------------------------

function initUi() {
	function onchange(element) { element.addEventListener('change', getUiState); }
	document.querySelectorAll("input[type='number']").forEach(onchange);
}

function setUiState() {
	document.getElementById('sx').value = uiState.sx;
	document.getElementById('sy').value = uiState.sy;
	document.getElementById('h').value = uiState.h;
	document.getElementById('width').value = uiState.width;
	document.getElementById('height').value = uiState.height;
}

function getUiState() {
	uiState.sx = document.getElementById('sx').valueAsNumber;
	uiState.sy = document.getElementById('sy').valueAsNumber;
	uiState.h = document.getElementById('h').valueAsNumber;
	uiState.width = document.getElementById('width').valueAsNumber;
	uiState.height = document.getElementById('height').valueAsNumber;
	draw_clear();
	draw_grid();
}

function initCanvas() {
	let size = Math.min(
		canvas.parentNode.clientWidth, canvas.parentNode.clientHeight);
	canvas.style.width = size + 'px';
	canvas.style.height = size + 'px';
	size = 1024;
	canvas.width = size;
	canvas.height = size;
	console.log(`Canvas size "${size}"`);
}

initCanvas();
initUi();
setUiState();
draw_grid();

