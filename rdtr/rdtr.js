// SPDX-License-Identifier: CC0-1.0.
/*
  This is the library module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
*/

import Konva from 'konva';

// ----------------------------------------------------------------------
// Units (counters)

// The UnitSheet class is made complicated by the "layout" element. It
// is necessary since the unit-sheets (PNG files) does not have the
// unit images in a perfect grid. They are offset in unpredictable
// ways, so we must compensate.
export const unit_side = 150
class UnitSheet {
	side = 150					// Side of a unit on the unit-sheet PNG
	scale = 0.32				// Adjust so it can fit into a map hex
	rows = 8;
	cols = 14;
	// The "layout" has x,y elements which consists of an array of
	// 3-tuples [row/col, offset, gap].
	layout;
	// The "imgData" may be an imported URL if the unit-sheet is
	// packed into the bundle, otherwise it's a file name.
	imgData;
	sheet;

	constructor(obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				this[prop] = obj[prop];
			}
		}
		let imgObj = new Image();
		imgObj.src = this.imgData;
		this.sheet = new Konva.Image({
			image: imgObj,
		});
	}
	// Compute the top-left corner of a unit within the unit-sheet.
	// The "layout" plays a vital role.
	#topLeft(x, y) {
		var y0, x0, gapX, gapY;
		for (let i = 0; i < this.layout.y.length; i++) {
			if (y < this.layout.y[i][0])
				break;
			y0 = this.layout.y[i][1];
			gapY = this.layout.y[i][2];
		}
		for (let i = 0; i < this.layout.x.length; i++) {
			if (x < this.layout.x[i][0])
				break;
			x0 = this.layout.x[i][1];
			gapX = this.layout.x[i][2];
		}
		return {x: x0 + (this.side + gapX) * x, y: y0 + (this.side + gapY) * y};
	}
	// Return 
	image(x, y, id) {
		var tl = this.#topLeft(x, y);
		return this.sheet.clone({
			id: id,
			width: this.side,
			height: this.side,
			crop: { x: tl.x, y: tl.y, width: this.side, height: this.side },
			scale: { x: this.scale, y: this.scale},
			cornerRadius: 16,
			draggable: true
		});
	}
}

// If the unit-sheet file is packed into the bundle use:
//import suSheetData from './tr-counters-ussr.png'
// If the unit-sheet file is loaded (from s server or local file):
const suSheetData = './tr-counters-ussr.png'
const geSheetData = './tr-counters-germany.png'
const frSheetData = './tr-counters-fr-usa.png'
const itSheetData = './tr-counters-italy.png'
const ukSheetData = './tr-counters-uk.png'
const vaSheetData = './tr-counters-variant.png'
// TODO: find a way to select this

const sheet = {
	su: new UnitSheet({
		imgData: suSheetData,
		layout: {
			x: [
				[0, 114, 13],
				[7, 164, 12],
				[11, 158, 13]
			],
			y: [
				[0, 158, 10],
				[2, 158, 13],
				[4, 162, 13],
				[6, 176, 13],
			]
		},
	}),
	ge: new UnitSheet({
		imgData: geSheetData,
		layout: {
			x: [
				[0, 126, 11],
				[7, 174, 11],
				[13, 180, 11],
			],
			y: [
				[0, 190, 16],
				[2, 196, 16],
				[4, 200, 16],
				[6, 186, 20],
			]
		},
	}),
	fr: new UnitSheet({
		imgData: frSheetData,
		layout: {
			x: [
				[0, 118, 14],
				[5, 120, 14],
				[7, 135, 15],
			],
			y: [
				[0, 83, 12],
				[3, 82, 15],
				[6, 84, 15],
				[7, 88, 15],
			]
		},
	}),
	it: new UnitSheet({
		imgData: itSheetData,
		layout: {
			x: [
				[0, 122, 14],
				[4, 124, 15],
				[7, 146, 14],
			],
			y: [
				[0, 184, 16],
				[2, 192, 16],
				[4, 200, 16],
				[6, 220, 16],
			]
		},
	}),
	uk: new UnitSheet({
		imgData: ukSheetData,
		layout: {
			x: [
				[0, 118, 15],
				[7, 140, 15],
				[11, 158, 13]
			],
			y: [
				[0, 160, 10],
				[2, 168, 15],
				[4, 176, 15],
				[6, 194, 15],
			]
		},
	}),
	va: new UnitSheet({
		imgData: vaSheetData,
		layout: {
			x: [
				[0, 130, 12],
				[5, 134, 12],
				[7, 202, 9]
			],
			y: [
				[0, 153, 16],
				[2, 160, 16],
				[4, 180, 10],
				[6, 170, 13],
			]
		},
	})
}

export function sheetImage(nat) {
	console.log(`nat: ${nat}`)
	return sheet[nat].sheet
}

// An array of all units.
// { sheet:fr, pos:{x:,y:}, type:"inf", nat: "fr", m:2, s:3, lbl:"8",
//   img:Image, map:{x:,y:}}  // (added later)
export const units = [
	{sheet:sheet.fr, pos:{x:0,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"Alp"},
	{sheet:sheet.fr, pos:{x:1,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"Col"},
	{sheet:sheet.fr, pos:{x:2,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"6"},
	{sheet:sheet.fr, pos:{x:3,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"7"},
	{sheet:sheet.fr, pos:{x:4,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"8"},
	{sheet:sheet.fr, pos:{x:5,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"10"},
	{sheet:sheet.fr, pos:{x:6,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"11"},
	{sheet:sheet.fr, pos:{x:0,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"13"},
	{sheet:sheet.fr, pos:{x:1,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"17"},
	{sheet:sheet.fr, pos:{x:2,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"16"},
	{sheet:sheet.fr, pos:{x:3,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"18"},
	{sheet:sheet.fr, pos:{x:4,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"24"},
	{sheet:sheet.fr, pos:{x:5,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"25"},
	{sheet:sheet.fr, pos:{x:6,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"42"},
	{sheet:sheet.fr, pos:{x:0,y:2}, type:"inf", nat: "fr", m:3, s:2, lbl:"44"},
	{sheet:sheet.fr, pos:{x:1,y:2}, type:"inf", nat: "fr", m:3, s:2, lbl:"45"},
	{sheet:sheet.fr, pos:{x:2,y:2}, type:"pz",  nat: "fr", m:5, s:3, lbl:"1"},
	{sheet:sheet.fr, pos:{x:3,y:2}, type:"pz",  nat: "fr", m:5, s:3, lbl:"2GCM"},
	{sheet:sheet.fr, pos:{x:4,y:2}, type:"pz",  nat: "fr", m:5, s:3, lbl:"5GCM"},
	{sheet:sheet.fr, pos:{x:6,y:2}, type:"air", nat: "fr", m:4, s:5},
	{sheet:sheet.fr, pos:{x:5,y:2}, type:"air", nat: "fr", m:4, s:5},
	{sheet:sheet.fr, pos:{x:5,y:2}, type:"air", nat: "fr", m:4, s:5},
	{sheet:sheet.fr, pos:{x:0,y:4}, type:"air", nat: "fr", s:3, m:4},
	{sheet:sheet.fr, pos:{x:1,y:4}, type:"air", nat: "fr", s:3, m:4},
	{sheet:sheet.fr, pos:{x:2,y:4}, type:"air", nat: "fr", s:2, m:4},
	{sheet:sheet.fr, pos:{x:3,y:4}, type:"air", nat: "fr", s:1, m:4},
	{sheet:sheet.fr, pos:{x:4,y:4}, type:"air", nat: "fr", s:1, m:4},
	{sheet:sheet.fr, pos:{x:4,y:6}, type:"ab", nat: "fr"},
	{sheet:sheet.fr, pos:{x:5,y:6}, type:"ab", nat: "fr"},
	{sheet:sheet.fr, pos:{x:6,y:6}, type:"ab", nat: "fr"},
	{sheet:sheet.fr, pos:{x:3,y:3}, type:"res", nat: "fr", s:1},
	{sheet:sheet.fr, pos:{x:4,y:3}, type:"res", nat: "fr", s:1},
	{sheet:sheet.fr, pos:{x:5,y:3}, type:"res", nat: "fr", s:1},
	{sheet:sheet.fr, pos:{x:6,y:3}, type:"res", nat: "fr", s:1},
	{sheet:sheet.fr, pos:{x:0,y:3}, type:"nav", nat: "fr", s:9},
	{sheet:sheet.fr, pos:{x:1,y:3}, type:"nav", nat: "fr", s:9},
	{sheet:sheet.fr, pos:{x:2,y:3}, type:"nav", nat: "fr", s:9},
	{sheet:sheet.fr, pos:{x:5,y:4}, type:"nav", nat: "fr", s:8},
	{sheet:sheet.fr, pos:{x:6,y:4}, type:"nav", nat: "fr", s:8},
	{sheet:sheet.fr, pos:{x:0,y:5}, type:"nav", nat: "fr", s:6},
	{sheet:sheet.fr, pos:{x:1,y:5}, type:"nav", nat: "fr", s:6},
	{sheet:sheet.fr, pos:{x:2,y:5}, type:"nav", nat: "fr", s:4},
	{sheet:sheet.fr, pos:{x:3,y:5}, type:"nav", nat: "fr", s:4},
	{sheet:sheet.fr, pos:{x:4,y:5}, type:"nav", nat: "fr", s:2},
	{sheet:sheet.fr, pos:{x:5,y:5}, type:"nav", nat: "fr", s:2},
	{sheet:sheet.fr, pos:{x:6,y:5}, type:"nav", nat: "fr", s:1},
	{sheet:sheet.fr, pos:{x:0,y:6}, type:"nav", nat: "fr", s:1},
	{sheet:sheet.va, pos:{x:7,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"1 Alg"},
	{sheet:sheet.va, pos:{x:8,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"2 Alg"},
	{sheet:sheet.va, pos:{x:9,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"3 Alg"},
	{sheet:sheet.va, pos:{x:10,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"1 Mor"},
	{sheet:sheet.va, pos:{x:11,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"2 Mor"},
	{sheet:sheet.va, pos:{x:12,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"1 Tun"},
	{sheet:sheet.va, pos:{x:13,y:4}, type:"pz", nat:"fr", s:3, m:5, lbl:"1 GCM"},
	{sheet:sheet.va, pos:{x:7,y:5}, type:"pz", nat:"fr", s:3, m:5, lbl:"3 GCM"},
	{sheet:sheet.va, pos:{x:8,y:5}, type:"pz", nat:"fr", s:3, m:5, lbl:"4 GCM"},
	{sheet:sheet.fr, pos:{x:7,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"2"},
	{sheet:sheet.fr, pos:{x:8,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"3"},
	{sheet:sheet.fr, pos:{x:9,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"4"},
	{sheet:sheet.fr, pos:{x:10,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"5"},
	{sheet:sheet.fr, pos:{x:11,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"6"},
	{sheet:sheet.fr, pos:{x:12,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"8"},
	{sheet:sheet.fr, pos:{x:13,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"10"},
	{sheet:sheet.fr, pos:{x:7,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"12"},
	{sheet:sheet.fr, pos:{x:8,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"19"},
	{sheet:sheet.fr, pos:{x:9,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"21"},
	{sheet:sheet.fr, pos:{x:10,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"22"},
	{sheet:sheet.fr, pos:{x:11,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"23"},
	{sheet:sheet.fr, pos:{x:12,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"25b"},
	{sheet:sheet.fr, pos:{x:13,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"26b"},
	{sheet:sheet.fr, pos:{x:7,y:2}, type:"inf", nat: "us", s:3, m:4, lbl:"27b"},
	{sheet:sheet.fr, pos:{x:8,y:2}, type:"par", nat: "us", s:3, m:3, lbl:"18AB"},
	{sheet:sheet.fr, pos:{x:9,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"1"},
	{sheet:sheet.fr, pos:{x:10,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"7"},
	{sheet:sheet.fr, pos:{x:11,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"13"},
	{sheet:sheet.fr, pos:{x:12,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"16"},
	{sheet:sheet.fr, pos:{x:13,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"20"},
	{sheet:sheet.fr, pos:{x:7,y:3}, type:"res", nat: "us", s:1},
	{sheet:sheet.fr, pos:{x:7,y:3}, type:"res", nat: "us", s:1},
	{sheet:sheet.fr, pos:{x:7,y:3}, type:"res", nat: "us", s:1},
	{sheet:sheet.fr, pos:{x:7,y:3}, type:"res", nat: "us", s:1},
	{sheet:sheet.fr, pos:{x:7,y:3}, type:"res", nat: "us", s:1},
	{sheet:sheet.fr, pos:{x:7,y:3}, type:"res", nat: "us", s:1},
	{sheet:sheet.fr, pos:{x:7,y:3}, type:"res", nat: "us", s:1},
	{sheet:sheet.fr, pos:{x:9,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:sheet.fr, pos:{x:10,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:sheet.fr, pos:{x:11,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:sheet.fr, pos:{x:12,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:sheet.fr, pos:{x:13,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:sheet.fr, pos:{x:10,y:7}, type:"air", nat: "us", s:3, m:4},
	{sheet:sheet.fr, pos:{x:11,y:7}, type:"air", nat: "us", s:3, m:4},
	{sheet:sheet.fr, pos:{x:12,y:7}, type:"air", nat: "us", s:2, m:4},
	{sheet:sheet.fr, pos:{x:13,y:7}, type:"air", nat: "us", s:2, m:4},
	{sheet:sheet.fr, pos:{x:0,y:7}, type:"air", nat: "us", s:1, m:4},
	{sheet:sheet.fr, pos:{x:0,y:7}, type:"air", nat: "us", s:1, m:4},
	{sheet:sheet.fr, pos:{x:0,y:7}, type:"air", nat: "us", s:1, m:4},
	{sheet:sheet.fr, pos:{x:3,y:7}, type:"ab", nat: "us"},
	{sheet:sheet.fr, pos:{x:4,y:7}, type:"ab", nat: "us"},
	{sheet:sheet.fr, pos:{x:5,y:7}, type:"ab", nat: "us"},
	{sheet:sheet.fr, pos:{x:7,y:4}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:8,y:4}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:9,y:4}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:10,y:4}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:11,y:4}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:12,y:4}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:13,y:4}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:7,y:5}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:8,y:5}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:8,y:5}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:8,y:5}, type:"nav", nat: "us", s:9},
	{sheet:sheet.fr, pos:{x:7,y:6}, type:"nav", nat: "us", s:8},
	{sheet:sheet.fr, pos:{x:8,y:6}, type:"nav", nat: "us", s:8},
	{sheet:sheet.fr, pos:{x:9,y:5}, type:"nav", nat: "us", s:6},
	{sheet:sheet.fr, pos:{x:10,y:5}, type:"nav", nat: "us", s:6},
	{sheet:sheet.fr, pos:{x:11,y:5}, type:"nav", nat: "us", s:4},
	{sheet:sheet.fr, pos:{x:12,y:5}, type:"nav", nat: "us", s:4},
	{sheet:sheet.fr, pos:{x:13,y:5}, type:"nav", nat: "us", s:2},
	{sheet:sheet.fr, pos:{x:7,y:7}, type:"nav", nat: "us", s:2},
	{sheet:sheet.fr, pos:{x:8,y:7}, type:"nav", nat: "us", s:1},
	{sheet:sheet.fr, pos:{x:9,y:7}, type:"nav", nat: "us", s:1},
	{sheet:sheet.su, pos:{x:0,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"2 Gds"},
	{sheet:sheet.su, pos:{x:1,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"3 Gds"},
	{sheet:sheet.su, pos:{x:2,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"5 Gds"},
	{sheet:sheet.su, pos:{x:3,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"6 Gds"},
	{sheet:sheet.su, pos:{x:4,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"7 Gds"},
	{sheet:sheet.su, pos:{x:5,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"8 Gds"},
	{sheet:sheet.su, pos:{x:6,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"11 Gds"},
	{sheet:sheet.su, pos:{x:0,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"1 Shk"},
	{sheet:sheet.su, pos:{x:1,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"2 Shk"},
	{sheet:sheet.su, pos:{x:2,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"3 Shk"},
	{sheet:sheet.su, pos:{x:3,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"5 Shk"},
	{sheet:sheet.su, pos:{x:4,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"Nav"},
	{sheet:sheet.su, pos:{x:5,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"53"},
	{sheet:sheet.su, pos:{x:6,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"57"},
	{sheet:sheet.su, pos:{x:0,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"60"},
	{sheet:sheet.su, pos:{x:1,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"61"},
	{sheet:sheet.su, pos:{x:2,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"62"},
	{sheet:sheet.su, pos:{x:3,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"63"},
	{sheet:sheet.su, pos:{x:4,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"64"},
	{sheet:sheet.su, pos:{x:5,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"70"},
	{sheet:sheet.su, pos:{x:6,y:2}, type:"par", nat: "su", s:2, m:3, lbl:"1 Pr"},
	{sheet:sheet.su, pos:{x:0,y:3}, type:"par", nat: "su", s:2, m:3, lbl:"2 Pr"},
	{sheet:sheet.su, pos:{x:1,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"3"},
	{sheet:sheet.su, pos:{x:2,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"4"},
	{sheet:sheet.su, pos:{x:3,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"5"},
	{sheet:sheet.su, pos:{x:4,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"6"},
	{sheet:sheet.su, pos:{x:5,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"7"},
	{sheet:sheet.su, pos:{x:6,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"8"},
	{sheet:sheet.su, pos:{x:0,y:4}, type:"inf", nat: "su", s:2, m:3, lbl:"9"},
	{sheet:sheet.su, pos:{x:1,y:4}, type:"inf", nat: "su", s:2, m:3, lbl:"10"},
	{sheet:sheet.su, pos:{x:2,y:4}, type:"inf", nat: "su", s:2, m:3, lbl:"11"},
	{sheet:sheet.su, pos:{x:3,y:4}, type:"inf", nat: "su", s:2, m:3, lbl:"12"},
	{sheet:sheet.su, pos:{x:4,y:4}, type:"inf", nat: "su", s:1, m:3, lbl:"13"},
	{sheet:sheet.su, pos:{x:5,y:4}, type:"inf", nat: "su", s:1, m:3, lbl:"14"},
	{sheet:sheet.su, pos:{x:6,y:4}, type:"inf", nat: "su", s:1, m:3, lbl:"16"},
	{sheet:sheet.su, pos:{x:0,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"18"},
	{sheet:sheet.su, pos:{x:1,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"19"},
	{sheet:sheet.su, pos:{x:2,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"20"},
	{sheet:sheet.su, pos:{x:3,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"21"},
	{sheet:sheet.su, pos:{x:4,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"22"},
	{sheet:sheet.su, pos:{x:5,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"23"},
	{sheet:sheet.su, pos:{x:6,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"24"},
	{sheet:sheet.su, pos:{x:0,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"26"},
	{sheet:sheet.su, pos:{x:1,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"27"},
	{sheet:sheet.su, pos:{x:2,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"28"},
	{sheet:sheet.su, pos:{x:3,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"29"},
	{sheet:sheet.su, pos:{x:4,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"30"},
	{sheet:sheet.su, pos:{x:5,y:6}, type:"pz", nat: "su", s:3, m:5, lbl:"3 Me"},
	{sheet:sheet.su, pos:{x:6,y:6}, type:"pz", nat: "su", s:3, m:5, lbl:"11 Tk"},
	{sheet:sheet.su, pos:{x:0,y:7}, type:"pz", nat: "su", s:3, m:5, lbl:"13 Me"},
	{sheet:sheet.su, pos:{x:1,y:7}, type:"pz", nat: "su", s:3, m:5, lbl:"15 Me"},
	{sheet:sheet.su, pos:{x:2,y:7}, type:"pz", nat: "su", s:3, m:5, lbl:"19 Me"},
	{sheet:sheet.su, pos:{x:3,y:7}, type:"pz", nat: "su", s:3, m:5, lbl:"22 Me"},
	{sheet:sheet.su, pos:{x:7,y:0}, type:"pz", nat: "su", s:4, m:5, lbl:"1 Tk"},
	{sheet:sheet.su, pos:{x:8,y:0}, type:"pz", nat: "su", s:4, m:5, lbl:"2 Tk"},
	{sheet:sheet.su, pos:{x:9,y:0}, type:"pz", nat: "su", s:4, m:5, lbl:"3 Tk"},
	{sheet:sheet.su, pos:{x:10,y:0}, type:"pz", nat: "su", s:4, m:5, lbl:"5 Tk"},
	{sheet:sheet.su, pos:{x:4,y:7}, type:"air", nat: "su", s:5, m:4},
	{sheet:sheet.su, pos:{x:4,y:7}, type:"air", nat: "su", s:5, m:4},
	{sheet:sheet.su, pos:{x:4,y:7}, type:"air", nat: "su", s:5, m:4},
	{sheet:sheet.su, pos:{x:9,y:2}, type:"air", nat: "su", s:3, m:4},
	{sheet:sheet.su, pos:{x:9,y:2}, type:"air", nat: "su", s:3, m:4},
	{sheet:sheet.su, pos:{x:11,y:2}, type:"air", nat: "su", s:2, m:4},
	{sheet:sheet.su, pos:{x:11,y:2}, type:"air", nat: "su", s:2, m:4},
	{sheet:sheet.su, pos:{x:7,y:3}, type:"air", nat: "su", s:1, m:4},
	{sheet:sheet.su, pos:{x:7,y:3}, type:"air", nat: "su", s:1, m:4},
	{sheet:sheet.su, pos:{x:12,y:3}, type:"ab", nat: "su"},
	{sheet:sheet.su, pos:{x:12,y:3}, type:"ab", nat: "su"},
	{sheet:sheet.su, pos:{x:12,y:3}, type:"ab", nat: "su"},
	{sheet:sheet.su, pos:{x:11,y:0}, type:"nav", nat: "su", s:9},
	{sheet:sheet.su, pos:{x:12,y:0}, type:"nav", nat: "su", s:9},
	{sheet:sheet.su, pos:{x:13,y:0}, type:"nav", nat: "su", s:9},
	{sheet:sheet.su, pos:{x:7,y:1}, type:"nav", nat: "su", s:8},
	{sheet:sheet.su, pos:{x:7,y:1}, type:"nav", nat: "su", s:8},
	{sheet:sheet.su, pos:{x:9,y:1}, type:"nav", nat: "su", s:6},
	{sheet:sheet.su, pos:{x:9,y:1}, type:"nav", nat: "su", s:6},
	{sheet:sheet.su, pos:{x:11,y:1}, type:"nav", nat: "su", s:4},
	{sheet:sheet.su, pos:{x:12,y:1}, type:"nav", nat: "su", s:2},
	{sheet:sheet.su, pos:{x:12,y:1}, type:"nav", nat: "su", s:2},
	{sheet:sheet.su, pos:{x:7,y:2}, type:"nav", nat: "su", s:1},
	{sheet:sheet.su, pos:{x:7,y:2}, type:"nav", nat: "su", s:1},
	{sheet:sheet.su, pos:{x:7,y:4}, type:"mec", nat: "su", s:2, m:5, lbl:"3"},
	{sheet:sheet.su, pos:{x:8,y:4}, type:"mec", nat: "su", s:2, m:5, lbl:"4"},
	{sheet:sheet.su, pos:{x:9,y:4}, type:"mec", nat: "su", s:2, m:5, lbl:"5"},
	{sheet:sheet.su, pos:{x:10,y:4}, type:"mec", nat: "su", s:2, m:5, lbl:"6"},
	{sheet:sheet.su, pos:{x:11,y:4}, type:"mec", nat: "su", s:2, m:5, lbl:"7"},
	{sheet:sheet.su, pos:{x:12,y:4}, type:"inf", nat: "su", s:2, m:4, lbl:"13"},
	{sheet:sheet.su, pos:{x:13,y:4}, type:"inf", nat: "su", s:2, m:4, lbl:"14"},
	{sheet:sheet.su, pos:{x:7,y:5}, type:"inf", nat: "su", s:2, m:4, lbl:"16"},
	{sheet:sheet.su, pos:{x:8,y:5}, type:"inf", nat: "su", s:2, m:4, lbl:"18"},
	{sheet:sheet.su, pos:{x:9,y:5}, type:"inf", nat: "su", s:2, m:4, lbl:"19"},
	{sheet:sheet.su, pos:{x:10,y:5}, type:"inf", nat: "su", s:2, m:4, lbl:"20"},
	{sheet:sheet.su, pos:{x:11,y:5}, type:"inf", nat: "su", s:2, m:4, lbl:"21"},
	{sheet:sheet.su, pos:{x:12,y:5}, type:"inf", nat: "su", s:2, m:4, lbl:"22"},
	{sheet:sheet.su, pos:{x:13,y:5}, type:"inf", nat: "su", s:2, m:4, lbl:"23"},
	{sheet:sheet.su, pos:{x:7,y:6}, type:"inf", nat: "su", s:2, m:4, lbl:"24"},
	{sheet:sheet.su, pos:{x:8,y:6}, type:"inf", nat: "su", s:2, m:4, lbl:"26"},
	{sheet:sheet.su, pos:{x:9,y:6}, type:"inf", nat: "su", s:2, m:4, lbl:"27"},
	{sheet:sheet.su, pos:{x:10,y:6}, type:"inf", nat: "su", s:2, m:4, lbl:"28"},
	{sheet:sheet.su, pos:{x:11,y:6}, type:"inf", nat: "su", s:2, m:4, lbl:"29"},
	{sheet:sheet.su, pos:{x:12,y:6}, type:"inf", nat: "su", s:2, m:4, lbl:"30"},
	{sheet:sheet.su, pos:{x:7,y:7}, type:"pz", nat: "su", s:4, m:6, lbl:"1 Tk"},
	{sheet:sheet.su, pos:{x:8,y:7}, type:"pz", nat: "su", s:4, m:6, lbl:"2 Tk"},
	{sheet:sheet.su, pos:{x:9,y:7}, type:"pz", nat: "su", s:4, m:6, lbl:"3 Tk"},
	{sheet:sheet.su, pos:{x:10,y:7}, type:"pz", nat: "su", s:4, m:6, lbl:"5 Tk"},
	{sheet:sheet.va, pos:{x:0,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"1"},
	{sheet:sheet.va, pos:{x:1,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"2"},
	{sheet:sheet.va, pos:{x:2,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"3"},
	{sheet:sheet.va, pos:{x:3,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"4"},
	{sheet:sheet.va, pos:{x:4,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"5"},
	{sheet:sheet.va, pos:{x:5,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"6"},
	{sheet:sheet.va, pos:{x:6,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"7"},	
	{sheet:sheet.va, pos:{x:0,y:1}, type:"pz", nat:"tu", s:2, m:5, lbl:"1"},
	{sheet:sheet.va, pos:{x:1,y:1}, type:"pz", nat:"tu", s:2, m:5, lbl:"2"},
	{sheet:sheet.va, pos:{x:2,y:1}, type:"air", nat:"tu", s:2, m:4, lbl:"Turk"},
	{sheet:sheet.va, pos:{x:3,y:1}, type:"air", nat:"tu", s:2, m:4, lbl:"Turk"},
	{sheet:sheet.va, pos:{x:4,y:1}, type:"nav", nat:"tu", s:2},
	{sheet:sheet.va, pos:{x:5,y:1}, type:"nav", nat:"tu", s:2},
	{sheet:sheet.va, pos:{x:6,y:1}, type:"nav", nat:"tu", s:2},
	{sheet:sheet.va, pos:{x:0,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Galicia"},
	{sheet:sheet.va, pos:{x:1,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Castilla"},
	{sheet:sheet.va, pos:{x:2,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Aragon"},
	{sheet:sheet.va, pos:{x:3,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Navarr"},
	{sheet:sheet.va, pos:{x:4,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Granad"},
	{sheet:sheet.va, pos:{x:5,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Cordob"},
	{sheet:sheet.va, pos:{x:6,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Andalu"},
	{sheet:sheet.va, pos:{x:0,y:3}, type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{sheet:sheet.va, pos:{x:0,y:3}, type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{sheet:sheet.va, pos:{x:0,y:3}, type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{sheet:sheet.va, pos:{x:3,y:3}, type:"nav", nat:"sp", s:2},
	{sheet:sheet.va, pos:{x:3,y:3}, type:"nav", nat:"sp", s:2},
	{sheet:sheet.va, pos:{x:3,y:3}, type:"nav", nat:"sp", s:2},
	{sheet:sheet.va, pos:{x:3,y:3}, type:"nav", nat:"sp", s:2},
	{sheet:sheet.va, pos:{x:0,y:4}, type:"pz", nat:"sp", s:2, m:5, lbl:"Madrid"},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:sheet.va, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:sheet.va, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:sheet.va, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:sheet.va, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:sheet.va, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:sheet.va, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:sheet.va, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:sheet.va, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:sheet.va, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:sheet.va, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:sheet.va, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:sheet.va, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:sheet.va, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:sheet.va, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:sheet.va, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:sheet.va, pos:{x:1,y:4}, type:"nav", nat:"nu", s:2},
	{sheet:sheet.va, pos:{x:1,y:4}, type:"nav", nat:"nu", s:2},
	{sheet:sheet.uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:sheet.uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:sheet.uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:sheet.uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:sheet.uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:sheet.va, pos:{x:7,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"1 Iraq"},
	{sheet:sheet.va, pos:{x:8,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"2 Iraq"},
	{sheet:sheet.va, pos:{x:9,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"3 Iraq"},
	{sheet:sheet.va, pos:{x:11,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"4 Iraq"},
	{sheet:sheet.va, pos:{x:12,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"5 Iraq"},
	{sheet:sheet.va, pos:{x:11,y:1}, type:"air", nat:"iq", s:2, m:4, lbl:"5 Iraq"},
	{sheet:sheet.it, pos:{x:7,y:3}, type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{sheet:sheet.it, pos:{x:7,y:3}, type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{sheet:sheet.it, pos:{x:7,y:3}, type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{sheet:sheet.it, pos:{x:7,y:3}, type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{sheet:sheet.it, pos:{x:11,y:3}, type:"air", nat:"bu", s:1, m:4, lbl:"Bulg"},
	{sheet:sheet.it, pos:{x:12,y:3}, type:"inf", nat:"ru", s:2, m:3, lbl:"Rum"},
	{sheet:sheet.it, pos:{x:12,y:3}, type:"inf", nat:"ru", s:2, m:3, lbl:"Rum"},
	{sheet:sheet.it, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:sheet.it, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:sheet.it, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:sheet.it, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:sheet.it, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:sheet.it, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:sheet.it, pos:{x:13,y:4}, type:"air", nat:"ru", s:1, m:4, lbl:"Rum"},
	{sheet:sheet.it, pos:{x:7,y:5}, type:"inf", nat:"hu", s:2, m:3, lbl:"Hun"},
	{sheet:sheet.it, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:sheet.it, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:sheet.it, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:sheet.it, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:sheet.it, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:sheet.it, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:sheet.it, pos:{x:7,y:6}, type:"air", nat:"hu", s:1, m:4, lbl:"Hun"},
	{sheet:sheet.it, pos:{x:8,y:6}, type:"air", nat:"fi", s:1, m:4, lbl:"Finn"},
	{sheet:sheet.it, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:sheet.it, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:sheet.it, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:sheet.it, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:sheet.it, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:sheet.it, pos:{x:0,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"5"},
	{sheet:sheet.it, pos:{x:1,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"8"},
	{sheet:sheet.it, pos:{x:2,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"10"},
	{sheet:sheet.it, pos:{x:3,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"12"},
	{sheet:sheet.it, pos:{x:4,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"11"},
	{sheet:sheet.it, pos:{x:5,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"CN"},
	{sheet:sheet.it, pos:{x:6,y:0}, type:"inf", nat:"it", s:3, m:3, lbl:"Celere"},
	{sheet:sheet.it, pos:{x:0,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"Libya"},
	{sheet:sheet.it, pos:{x:1,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"14"},
	{sheet:sheet.it, pos:{x:2,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"16"},
	{sheet:sheet.it, pos:{x:3,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"17"},
	{sheet:sheet.it, pos:{x:4,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"20"},
	{sheet:sheet.it, pos:{x:5,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"35"},
	{sheet:sheet.it, pos:{x:6,y:1}, type:"inf", nat:"it", s:3, m:3, lbl:"Alpini"},
	{sheet:sheet.it, pos:{x:0,y:2}, type:"par", nat:"it", s:2, m:3, lbl:"Fologre"},
	{sheet:sheet.it, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:sheet.it, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:sheet.it, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:sheet.it, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:sheet.it, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:sheet.it, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:sheet.it, pos:{x:0,y:3}, type:"pz", nat:"it", s:2, m:5, lbl:"1"},
	{sheet:sheet.it, pos:{x:1,y:3}, type:"pz", nat:"it", s:2, m:5, lbl:"2"},
	{sheet:sheet.it, pos:{x:2,y:3}, type:"pz", nat:"it", s:2, m:5, lbl:"21"},
	{sheet:sheet.it, pos:{x:3,y:3}, type:"pz", nat:"it", s:2, m:5, lbl:"Celere"},
	{sheet:sheet.it, pos:{x:3,y:4}, type:"air", nat:"it", s:5, m:4},
	{sheet:sheet.it, pos:{x:3,y:4}, type:"air", nat:"it", s:5, m:4},
	{sheet:sheet.it, pos:{x:3,y:4}, type:"air", nat:"it", s:5, m:4},
	{sheet:sheet.it, pos:{x:0,y:7}, type:"air", nat:"it", s:3, m:4},
	{sheet:sheet.it, pos:{x:0,y:7}, type:"air", nat:"it", s:3, m:4},
	{sheet:sheet.it, pos:{x:2,y:7}, type:"air", nat:"it", s:2, m:4},
	{sheet:sheet.it, pos:{x:2,y:7}, type:"air", nat:"it", s:2, m:4},
	{sheet:sheet.it, pos:{x:4,y:7}, type:"air", nat:"it", s:1, m:4},
	{sheet:sheet.it, pos:{x:0,y:5}, type:"ab", nat:"it"},
	{sheet:sheet.it, pos:{x:0,y:5}, type:"ab", nat:"it"},
	{sheet:sheet.it, pos:{x:0,y:5}, type:"ab", nat:"it"},
	{sheet:sheet.it, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:sheet.it, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:sheet.it, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:sheet.it, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:sheet.it, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:sheet.it, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:sheet.it, pos:{x:4,y:5}, type:"nav", nat:"it", s:8},
	{sheet:sheet.it, pos:{x:4,y:5}, type:"nav", nat:"it", s:8},
	{sheet:sheet.it, pos:{x:6,y:5}, type:"nav", nat:"it", s:6},
	{sheet:sheet.it, pos:{x:6,y:5}, type:"nav", nat:"it", s:6},
	{sheet:sheet.it, pos:{x:1,y:6}, type:"nav", nat:"it", s:4},
	{sheet:sheet.it, pos:{x:1,y:6}, type:"nav", nat:"it", s:4},
	{sheet:sheet.it, pos:{x:3,y:6}, type:"nav", nat:"it", s:2},
	{sheet:sheet.it, pos:{x:3,y:6}, type:"nav", nat:"it", s:2},
	{sheet:sheet.it, pos:{x:5,y:6}, type:"nav", nat:"it", s:1},
	{sheet:sheet.it, pos:{x:5,y:6}, type:"nav", nat:"it", s:1},
	{sheet:sheet.va, pos:{x:7,y:0}, type:"pz", nat:"it", s:2, m:5, lbl:"Maletti"},
	{sheet:sheet.va, pos:{x:9,y:0}, type:"inf", nat:"it", s:3, m:3, lbl:"Centauro"},
	{sheet:sheet.va, pos:{x:10,y:0}, type:"inf", nat:"it", s:3, m:3, lbl:"Freccia"},
	{sheet:sheet.uk, pos:{x:0,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"1 BEF"},
	{sheet:sheet.uk, pos:{x:1,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"2 BEF"},
	{sheet:sheet.uk, pos:{x:2,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"5"},
	{sheet:sheet.uk, pos:{x:3,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"8"},
	{sheet:sheet.uk, pos:{x:4,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"9"},
	{sheet:sheet.uk, pos:{x:5,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"12"},
	{sheet:sheet.uk, pos:{x:6,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"2 Can"},
	{sheet:sheet.uk, pos:{x:0,y:1}, type:"inf", nat:"uk", s:1, m:3, lbl:"Egypt"},
	{sheet:sheet.uk, pos:{x:1,y:1}, type:"inf", nat:"uk", s:1, m:3, lbl:"Palest"},
	{sheet:sheet.uk, pos:{x:2,y:1}, type:"inf", nat:"uk", s:1, m:3, lbl:"Malta"},
	{sheet:sheet.uk, pos:{x:3,y:1}, type:"pz", nat:"uk", s:4, m:5, lbl:"13"},
	{sheet:sheet.uk, pos:{x:4,y:1}, type:"pz", nat:"uk", s:4, m:5, lbl:"30"},
	{sheet:sheet.uk, pos:{x:5,y:1}, type:"pz", nat:"uk", s:4, m:5, lbl:"1 Can"},
	{sheet:sheet.uk, pos:{x:6,y:1}, type:"pz", nat:"uk", s:4, m:5, lbl:"Polish"},
	{sheet:sheet.uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:6,y:2}, type:"par", nat:"uk", s:3, m:3, lbl:"1 AB"},
	{sheet:sheet.uk, pos:{x:0,y:3}, type:"pz", nat:"uk", s:2, m:5, lbl:"WDF"},
	{sheet:sheet.uk, pos:{x:1,y:3}, type:"air", nat:"uk", s:5, m:4},
	{sheet:sheet.uk, pos:{x:1,y:3}, type:"air", nat:"uk", s:5, m:4},
	{sheet:sheet.uk, pos:{x:1,y:3}, type:"air", nat:"uk", s:5, m:4},
	{sheet:sheet.uk, pos:{x:1,y:3}, type:"air", nat:"uk", s:5, m:4},
	{sheet:sheet.uk, pos:{x:7,y:4}, type:"air", nat:"uk", s:3, m:4},
	{sheet:sheet.uk, pos:{x:7,y:4}, type:"air", nat:"uk", s:3, m:4},
	{sheet:sheet.uk, pos:{x:7,y:4}, type:"air", nat:"uk", s:3, m:4},
	{sheet:sheet.uk, pos:{x:10,y:4}, type:"air", nat:"uk", s:2, m:4},
	{sheet:sheet.uk, pos:{x:10,y:4}, type:"air", nat:"uk", s:2, m:4},
	{sheet:sheet.uk, pos:{x:10,y:4}, type:"air", nat:"uk", s:2, m:4},
	{sheet:sheet.uk, pos:{x:8,y:5}, type:"air", nat:"uk", s:1, m:4},
	{sheet:sheet.uk, pos:{x:8,y:5}, type:"air", nat:"uk", s:1, m:4},
	{sheet:sheet.uk, pos:{x:8,y:5}, type:"air", nat:"uk", s:1, m:4},
	{sheet:sheet.uk, pos:{x:8,y:5}, type:"air", nat:"uk", s:1, m:4},
	{sheet:sheet.uk, pos:{x:1,y:5}, type:"ab", nat:"uk"},
	{sheet:sheet.uk, pos:{x:1,y:5}, type:"ab", nat:"uk"},
	{sheet:sheet.uk, pos:{x:1,y:5}, type:"ab", nat:"uk"},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:11,y:1}, type:"nav", nat:"uk", s:8},
	{sheet:sheet.uk, pos:{x:11,y:1}, type:"nav", nat:"uk", s:8},
	{sheet:sheet.uk, pos:{x:11,y:1}, type:"nav", nat:"uk", s:8},
	{sheet:sheet.uk, pos:{x:11,y:1}, type:"nav", nat:"uk", s:8},
	{sheet:sheet.uk, pos:{x:7,y:2}, type:"nav", nat:"uk", s:6},
	{sheet:sheet.uk, pos:{x:7,y:2}, type:"nav", nat:"uk", s:6},
	{sheet:sheet.uk, pos:{x:7,y:2}, type:"nav", nat:"uk", s:6},
	{sheet:sheet.uk, pos:{x:10,y:2}, type:"nav", nat:"uk", s:4},
	{sheet:sheet.uk, pos:{x:10,y:2}, type:"nav", nat:"uk", s:4},
	{sheet:sheet.uk, pos:{x:10,y:2}, type:"nav", nat:"uk", s:4},
	{sheet:sheet.uk, pos:{x:7,y:3}, type:"nav", nat:"uk", s:2},
	{sheet:sheet.uk, pos:{x:7,y:3}, type:"nav", nat:"uk", s:2},
	{sheet:sheet.uk, pos:{x:7,y:3}, type:"nav", nat:"uk", s:2},
	{sheet:sheet.uk, pos:{x:10,y:3}, type:"nav", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:10,y:3}, type:"nav", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:10,y:3}, type:"nav", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:10,y:3}, type:"nav", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:0,y:6}, type:"esc", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:1,y:6}, type:"esc", nat:"uk", s:2},
	{sheet:sheet.uk, pos:{x:2,y:6}, type:"esc", nat:"uk", s:3},
	{sheet:sheet.uk, pos:{x:3,y:6}, type:"esc", nat:"uk", s:4},
	{sheet:sheet.uk, pos:{x:4,y:6}, type:"esc", nat:"uk", s:5},
	{sheet:sheet.uk, pos:{x:5,y:6}, type:"esc", nat:"uk", s:6},
	{sheet:sheet.uk, pos:{x:6,y:6}, type:"esc", nat:"uk", s:7},
	{sheet:sheet.uk, pos:{x:0,y:7}, type:"esc", nat:"uk", s:8},
	{sheet:sheet.uk, pos:{x:1,y:7}, type:"esc", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:2,y:7}, type:"esc", nat:"uk", s:10},
	{sheet:sheet.uk, pos:{x:3,y:7}, type:"esc", nat:"uk", s:20},
	{sheet:sheet.uk, pos:{x:7,y:0}, type:"bmb", nat:"uk", s:1},
	{sheet:sheet.uk, pos:{x:8,y:0}, type:"bmb", nat:"uk", s:2},
	{sheet:sheet.uk, pos:{x:9,y:0}, type:"bmb", nat:"uk", s:3},
	{sheet:sheet.uk, pos:{x:10,y:0}, type:"bmb", nat:"uk", s:4},
	{sheet:sheet.uk, pos:{x:11,y:0}, type:"bmb", nat:"uk", s:5},
	{sheet:sheet.uk, pos:{x:12,y:0}, type:"bmb", nat:"uk", s:6},
	{sheet:sheet.uk, pos:{x:13,y:0}, type:"bmb", nat:"uk", s:7},
	{sheet:sheet.uk, pos:{x:7,y:1}, type:"bmb", nat:"uk", s:8},
	{sheet:sheet.uk, pos:{x:8,y:1}, type:"bmb", nat:"uk", s:9},
	{sheet:sheet.uk, pos:{x:9,y:1}, type:"bmb", nat:"uk", s:10},
	{sheet:sheet.uk, pos:{x:10,y:1}, type:"bmb", nat:"uk", s:20},
	{sheet:sheet.va, pos:{x:7,y:6}, type:"mec", nat:"uk", s:2, m:5, lbl:"Egypt"},
	{sheet:sheet.va, pos:{x:8,y:6}, type:"mec", nat:"uk", s:2, m:5, lbl:"Palest"},
	{sheet:sheet.va, pos:{x:9,y:6}, type:"mec", nat:"uk", s:2, m:5, lbl:"Malta"},
	{sheet:sheet.va, pos:{x:10,y:6}, type:"inf", nat:"uk", s:2, m:3, lbl:"Egypt"},
	{sheet:sheet.va, pos:{x:11,y:6}, type:"inf", nat:"uk", s:2, m:3, lbl:"Palest"},
	{sheet:sheet.va, pos:{x:12,y:6}, type:"inf", nat:"uk", s:2, m:3, lbl:"Malta"},
	{sheet:sheet.ge, pos:{x:0,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"1"},
	{sheet:sheet.ge, pos:{x:1,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"2"},
	{sheet:sheet.ge, pos:{x:2,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"3"},
	{sheet:sheet.ge, pos:{x:3,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"4"},
	{sheet:sheet.ge, pos:{x:4,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"6"},
	{sheet:sheet.ge, pos:{x:5,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"7"},
	{sheet:sheet.ge, pos:{x:6,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"8"},
	{sheet:sheet.ge, pos:{x:0,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"9"},
	{sheet:sheet.ge, pos:{x:1,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"10"},
	{sheet:sheet.ge, pos:{x:2,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"5 SS"},
	{sheet:sheet.ge, pos:{x:3,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"13 SS"},
	{sheet:sheet.ge, pos:{x:4,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"15"},
	{sheet:sheet.ge, pos:{x:5,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"18"},
	{sheet:sheet.ge, pos:{x:6,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"20"},
	{sheet:sheet.ge, pos:{x:0,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"23"},
	{sheet:sheet.ge, pos:{x:1,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"25"},
	{sheet:sheet.ge, pos:{x:2,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"27"},
	{sheet:sheet.ge, pos:{x:3,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"30"},
	{sheet:sheet.ge, pos:{x:4,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"36"},
	{sheet:sheet.ge, pos:{x:5,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"39"},
	{sheet:sheet.ge, pos:{x:6,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"40"},
	{sheet:sheet.ge, pos:{x:0,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"44"},
	{sheet:sheet.ge, pos:{x:1,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"51"},
	{sheet:sheet.ge, pos:{x:2,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"67"},
	{sheet:sheet.ge, pos:{x:3,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"74"},
	{sheet:sheet.ge, pos:{x:4,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"76"},
	{sheet:sheet.ge, pos:{x:5,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"84"},
	{sheet:sheet.ge, pos:{x:6,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"11"},
	{sheet:sheet.ge, pos:{x:0,y:4}, type:"inf", nat:"ge", s:3, m:3, lbl:"17"},
	{sheet:sheet.ge, pos:{x:1,y:4}, type:"inf", nat:"ge", s:3, m:3, lbl:"29"},
	{sheet:sheet.ge, pos:{x:2,y:4}, type:"inf", nat:"ge", s:3, m:3, lbl:"2 Fsjr"},
	{sheet:sheet.ge, pos:{x:3,y:4}, type:"inf", nat:"ge", s:1, m:3, lbl:"49"},
	{sheet:sheet.ge, pos:{x:4,y:4}, type:"inf", nat:"ge", s:1, m:3, lbl:"50"},
	{sheet:sheet.ge, pos:{x:5,y:4}, type:"inf", nat:"ge", s:1, m:3, lbl:"56"},
	{sheet:sheet.ge, pos:{x:6,y:4}, type:"inf", nat:"ge", s:1, m:3, lbl:"66"},
	{sheet:sheet.ge, pos:{x:0,y:5}, type:"inf", nat:"ge", s:1, m:3, lbl:"79"},
	{sheet:sheet.ge, pos:{x:1,y:5}, type:"inf", nat:"ge", s:1, m:3, lbl:"81"},
	{sheet:sheet.ge, pos:{x:2,y:5}, type:"par", nat:"ge", s:3, m:3, lbl:"1 Fsjr"},
	{sheet:sheet.ge, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:4,y:6}, type:"pz", nat:"ge", s:5, m:6, lbl:"1 SS"},
	{sheet:sheet.ge, pos:{x:5,y:6}, type:"pz", nat:"ge", s:5, m:6, lbl:"GDS"},
	{sheet:sheet.ge, pos:{x:6,y:6}, type:"pz", nat:"ge", s:4, m:6, lbl:"57"},
	{sheet:sheet.ge, pos:{x:0,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"2 SS"},
	{sheet:sheet.ge, pos:{x:1,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"14"},
	{sheet:sheet.ge, pos:{x:2,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"19"},
	{sheet:sheet.ge, pos:{x:3,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"24"},
	{sheet:sheet.ge, pos:{x:4,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"41"},
	{sheet:sheet.ge, pos:{x:5,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"46"},
	{sheet:sheet.ge, pos:{x:6,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"47"},
	{sheet:sheet.ge, pos:{x:7,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"48"},
	{sheet:sheet.ge, pos:{x:8,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"56"},
	{sheet:sheet.ge, pos:{x:9,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"39"},
	{sheet:sheet.ge, pos:{x:10,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"DAK"},
	{sheet:sheet.ge, pos:{x:11,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"9"},
	{sheet:sheet.ge, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:sheet.ge, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:sheet.ge, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:sheet.ge, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:sheet.ge, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:sheet.ge, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:sheet.it, pos:{x:8,y:0}, type:"air", nat:"ge", s:3, m:4},
	{sheet:sheet.it, pos:{x:8,y:0}, type:"air", nat:"ge", s:3, m:4},
	{sheet:sheet.it, pos:{x:8,y:0}, type:"air", nat:"ge", s:3, m:4},
	{sheet:sheet.it, pos:{x:8,y:0}, type:"air", nat:"ge", s:3, m:4},
	{sheet:sheet.it, pos:{x:7,y:0}, type:"air", nat:"ge", s:2, m:4},
	{sheet:sheet.it, pos:{x:7,y:0}, type:"air", nat:"ge", s:2, m:4},
	{sheet:sheet.it, pos:{x:7,y:0}, type:"air", nat:"ge", s:2, m:4},
	{sheet:sheet.ge, pos:{x:10,y:7}, type:"air", nat:"ge", s:1, m:4},
	{sheet:sheet.ge, pos:{x:10,y:7}, type:"air", nat:"ge", s:1, m:4},
	{sheet:sheet.ge, pos:{x:10,y:7}, type:"air", nat:"ge", s:1, m:4},
	{sheet:sheet.ge, pos:{x:10,y:7}, type:"air", nat:"ge", s:1, m:4},
	{sheet:sheet.ge, pos:{x:8,y:5}, type:"ab", nat:"ge"},
	{sheet:sheet.ge, pos:{x:8,y:5}, type:"ab", nat:"ge"},
	{sheet:sheet.ge, pos:{x:8,y:5}, type:"ab", nat:"ge"},
	{sheet:sheet.ge, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:sheet.ge, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:sheet.ge, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:sheet.ge, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:sheet.ge, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:sheet.ge, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:sheet.ge, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:sheet.ge, pos:{x:8,y:6}, type:"nav", nat:"ge", s:8},
	{sheet:sheet.ge, pos:{x:9,y:6}, type:"nav", nat:"ge", s:6},
	{sheet:sheet.ge, pos:{x:9,y:6}, type:"nav", nat:"ge", s:6},
	{sheet:sheet.ge, pos:{x:11,y:6}, type:"nav", nat:"ge", s:4},
	{sheet:sheet.ge, pos:{x:11,y:6}, type:"nav", nat:"ge", s:4},
	{sheet:sheet.ge, pos:{x:7,y:7}, type:"nav", nat:"ge", s:2},
	{sheet:sheet.ge, pos:{x:7,y:7}, type:"nav", nat:"ge", s:2},
	{sheet:sheet.ge, pos:{x:9,y:7}, type:"nav", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:9,y:7}, type:"nav", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:7,y:2}, type:"sub", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:8,y:2}, type:"sub", nat:"ge", s:2},
	{sheet:sheet.ge, pos:{x:9,y:2}, type:"sub", nat:"ge", s:3},
	{sheet:sheet.ge, pos:{x:10,y:2}, type:"sub", nat:"ge", s:4},
	{sheet:sheet.ge, pos:{x:11,y:2}, type:"sub", nat:"ge", s:5},
	{sheet:sheet.ge, pos:{x:12,y:2}, type:"sub", nat:"ge", s:6},
	{sheet:sheet.ge, pos:{x:13,y:2}, type:"sub", nat:"ge", s:7},
	{sheet:sheet.ge, pos:{x:7,y:3}, type:"sub", nat:"ge", s:8},
	{sheet:sheet.ge, pos:{x:8,y:3}, type:"sub", nat:"ge", s:9},
	{sheet:sheet.ge, pos:{x:9,y:3}, type:"sub", nat:"ge", s:10},
	{sheet:sheet.ge, pos:{x:10,y:3}, type:"sub", nat:"ge", s:20},
	{sheet:sheet.ge, pos:{x:11,y:3}, type:"int", nat:"ge", s:1},
	{sheet:sheet.ge, pos:{x:12,y:3}, type:"int", nat:"ge", s:2},
	{sheet:sheet.ge, pos:{x:13,y:3}, type:"int", nat:"ge", s:3},
	{sheet:sheet.ge, pos:{x:7,y:4}, type:"int", nat:"ge", s:4},
	{sheet:sheet.ge, pos:{x:8,y:4}, type:"int", nat:"ge", s:5},
	{sheet:sheet.ge, pos:{x:9,y:4}, type:"int", nat:"ge", s:6},
	{sheet:sheet.ge, pos:{x:10,y:4}, type:"int", nat:"ge", s:7},
	{sheet:sheet.ge, pos:{x:11,y:4}, type:"int", nat:"ge", s:8},
	{sheet:sheet.ge, pos:{x:12,y:4}, type:"int", nat:"ge", s:9},
	{sheet:sheet.ge, pos:{x:13,y:4}, type:"int", nat:"ge", s:10},
	{sheet:sheet.ge, pos:{x:7,y:5}, type:"int", nat:"ge", s:20},
	{sheet:sheet.va, pos:{x:7,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"49"},
	{sheet:sheet.va, pos:{x:8,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"50"},
	{sheet:sheet.va, pos:{x:9,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"56"},
	{sheet:sheet.va, pos:{x:10,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"66"},
	{sheet:sheet.va, pos:{x:11,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"79"},
	{sheet:sheet.va, pos:{x:12,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"81"},
	{sheet:sheet.va, pos:{x:7,y:3}, type:"par", nat:"ge", s:3, m:3, lbl:"2 Fsjr"},
	{sheet:sheet.va, pos:{x:8,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"Sp SS"},
	{sheet:sheet.va, pos:{x:9,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"Tu SS"},
	{sheet:sheet.va, pos:{x:10,y:3}, type:"inf", nat:"ge", s:1, m:3, lbl:"1 Fr SS"},
	{sheet:sheet.va, pos:{x:11,y:3}, type:"inf", nat:"ge", s:1, m:3, lbl:"2 Fr SS"},
	{sheet:sheet.va, pos:{x:12,y:3}, type:"inf", nat:"ge", s:1, m:3, lbl:"Croat SS"},
];

// This object will contain *indexes* of units sorted by nation
export const nat = {
	fr: [],
	us: [],
	it: [],
	ge: [],
	uk: [],
	su: [],
	tu: [],
	sp: [],
	nu: [],
	bu: [],
	ru: [],
	hu: [],
	fi: [],
	iq: [],
};

for (const [i, u] of units.entries()) {
	u.img = u.sheet.image(u.pos.x, u.pos.y, `rdtru${i}`)
	u.img.on('dragstart', function () {
		this.moveToTop()
	})
	u.img.on('dragend', function () {
		unitSnapToHex(this)
	})
	nat[u.nat].push(i);
}

// ----------------------------------------------------------------------
// Map

const hsize = 58.7;				// --size to hex.py
const hscale = 0.988;			// --scale to hex.py
const rsize = hsize * hscale * Math.sqrt(3) / 2;  // row interval
const grid_offset = {x:57, y:23}  // 0,0 on the map image
const unitOffset = 23			  // To adjust the unit image on a hex

// Hex Coordinate Functions:
// The pixel functions uses offset coordinates (hex) for "pointy"
// hexes. They take --scale into account.
export function pixelToHex(pos) {
	// This function is NOT perfect! A click near the top/bottom of a
	// hex *may* select an adjacent hex. But for practical use, it
	// is good enough for me.

	// Adjust for grid/map offset
	pos = {x:pos.x + grid_offset.x, y:pos.y + grid_offset.y}
	y = Math.round(pos.y / rsize - 0.42) // 0.42 ~= 5/12
	if (y % 2 == 0) {
		x = Math.round(pos.x / hsize)
	} else {
		x = Math.round(pos.x / hsize - 0.5)
	}
	return({x:x, y:y});
}
export function hexToPixel(hex) {
	y = Math.round(hex.y * rsize + rsize/3)
	if (hex.y % 2 == 0) {
		x = Math.round(hex.x * hsize)
	} else {
		x = Math.round(hex.x * hsize + (hsize/2))
	}
	// Adjust for grid/map offset
	return({x:x - grid_offset.x, y:y - grid_offset.y});
}
export function hexToAxial(hex) {
	if (hex.y % 2 == 0) {
		q =  hex.x - hex.y / 2
	} else {
		q = hex.x - (hex.y - 1) / 2
	}
	return {q: q, r: hex.y}
}
export function axialToHex(ax) {
	if (ax.r % 2 == 0) {
		x = ax.q + ax.r / 2
	} else {
		x = ax.q + (ax.r - 1) / 2
	}
	return {x:x, y: ax.r}
}
// RDTR uses letters A-KK for row, and a positive int for q.
export function axialToRdtr(ax) {
	if (ax.r < 27) {
		r = String.fromCharCode(ax.r + 64)
	} else {
		let c = ax.r + 38
		r = String.fromCharCode(c, c)
	}
	return {q: ax.q + 15, r: r}
}
export function rdtrToAxial(rc) {
	r = rc.r.charCodeAt(0) - 64
	if (rc.r.length > 1) {
		r += 26
	}
	return {q: rc.q - 15, r: r}
}
export function rdtrToHex(rc) {
	return axialToHex(rdtrToAxial(rc))
}
export function hexToRdtr(hex) {
	return axialToRdtr(hexToAxial(hex))
}

// Unit placement functions:
export function unitPixelPos(hex) {
	let h = hexToPixel(hex)
	return {x: h.x - unitOffset, y: h.y - unitOffset}
}
export function unitPlace(u, hex, parent) {
	u.hex = hex
	px = unitPixelPos(hex)
	u.img.x(px.x)
	u.img.y(px.y)
	parent.add(u.img)
}
export function unitPlaceRdtr(u, rc, parent) {
	unitPlace(u, rdtrToHex(rc), parent)
}
// This function should be called after the user has placed a unit,
// for instance from 'dragend'.
export function unitSnapToHex(img, parent) {
	// Get the unit object from the image id, which is `rdtru${i}`
	i = Number(img.id().substring(5))
	u = units[i]
	// The unit img coordinate is top-left, adjust to center
	pos = {x:img.x() + unitOffset, y:img.y() + unitOffset}
	// Get the hex, and update the unit object
	hex = pixelToHex(pos)
	u.pos = hex
	// Snap!
	pos = unitPixelPos(hex)		// adjusted pos
	img.position(pos)
}
export function unitDeploy(deployment, parent) {
	for (d of deployment) {
		u = units[d.i]
		unitPlaceRdtr(u, d.rc, parent)
	}
}

const imageObj = new Image();
imageObj.src = './rdtr-map.png'
export const map = new Konva.Image({
    image: imageObj,
});
