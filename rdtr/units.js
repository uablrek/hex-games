// SPDX-License-Identifier: CC0-1.0.
/*
  This is the unit library module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
 */
import {pixelToHex, hexToPixel, rdtrToHex} from './rdtr.js';

// Enable testing with node.js
var newImage = function() { return new Image() }
if (localStorage.getItem("nodejsTest") == "yes") {
	newImage = function() { return {} }
}

// The UnitSheet class is made complicated by the "layout" element. It
// is necessary since the unit-sheets (PNG files) does not have the
// unit images in a perfect grid. They are offset in unpredictable
// ways, so we must compensate.
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
		let imgObj = newImage();
		imgObj.src = this.imgData;
		this.sheet = new Konva.Image({
			image: imgObj,
		});
	}
	destroy() {
		this.sheet.destroy()
		this.imgData = null
		this.layout = null
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
// If the unit-sheet file is loaded (from server or local file):
const suSheetData = './tr-counters-ussr.png'
const geSheetData = './tr-counters-germany.png'
const frSheetData = './tr-counters-fr-usa.png'
const itSheetData = './tr-counters-italy.png'
const ukSheetData = './tr-counters-uk.png'
const vaSheetData = './tr-counters-variant.png'
// TODO: find a way to select this

let sheet = {
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


// An array of all units.
// { sheet:fr, pos:{x:,y:}, type:"inf", nat: "fr", m:2, s:3, lbl:"8",
//   img:Image, hex:{x:,y:}}  // and more, added later
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
	{sheet:sheet.va, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3}, // 13 x 1-3
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
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3}, // 14 x 2-3
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:sheet.va, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4}, // 7 x 1-4
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

// Load the unit index and images
for (const [i, u] of units.entries()) {
	u.i = i
	u.img = u.sheet.image(u.pos.x, u.pos.y, `rdtru${i}`)
}

// Now we no longer needs the unit-sheets. Remove the references so
// they can be garbage-collected
for (const u of units) {
	delete u.sheet
}
for (const s in sheet) {
	sheet[s].destroy()
	sheet[s] = null
}
sheet = null

// ----------------------------------------------------------------------
// Unit find and user-friendly representation
export function unselectAll() {
	for (const u of units) {
		delete u.selected
	}
}
export function fromStr(str, offmap=true) {
	// return the first found unit that matches str
	let v, nat, type, s, m, lbl, unit
	v = str.split(',')
	// The first 2 fields nat,type are mandatory
	nat = v[0]
	type = v[1]
	if (v.length > 2) {
		// This may be a single number, or something like "3-3"
		let stat = v[2].split('-')
		s = stat[0]
		if (stat.length > 1) m = stat[1]
	}
	if (v.length > 2) lbl = v[3]
	for (const u of units) {
		if (u.selected) continue
		if (offmap && u.hex) continue
		if (nat != u.nat) continue
		if (type != u.type) continue
		if (!s) {
			unit = u
			break
		}
		if (s != u.s) continue
		if (!m) {
			unit = u
			break
		}
		if (m != u.m) continue
		if (!lbl) {
			unit = u
			break
		}
		if (lbl != u.lbl) continue
		// Perfect match
		unit = u
		break
	}
	if (unit) unit.selected = true
	return unit
}
export function toStr(u) {
	switch (u.type) {
	case "inf":
	case "pz":
	case "air":
	case "par":
	case "mec":
		if (u.lbl) {
			return `${u.nat},${u.type},${u.s}-${u.m},${u.lbl}`
		} else {
			return `${u.nat},${u.type},${u.s}-${u.m}`
		}
	case "res":
	case "nav":
	case "esc":
	case "bmb":
	case "sub":
	case "int":
		return `${u.nat},${u.type},${u.s}`
	case "ab":
	case "bh":
		return `${u.nat},${u.type}`
	}
	return "unknown-unit"
}

export function fromImage(img) {
	// The unit-image's unique id is "rdtru#", where '#' is the index
	// in the "units" array
	i = Number(img.id().substring(5))
	return units[i]
}

// ----------------------------------------------------------------------
// Unit placement functions:

const imageOffset = 23			  // To adjust the unit image on a hex

export function removeFromMap(u) {
	if (!u.hex) return
	u.img.remove()
	delete u.hex
}

function pixelPos(hex) {
	let h = hexToPixel(hex)
	return {x: h.x - imageOffset, y: h.y - imageOffset}
}
function place(u, hex, parent) {
	u.hex = hex
	px = pixelPos(hex)
	if (isStack(hex)) px = stackAdjust(px)
	u.img.x(px.x)
	u.img.y(px.y)
	u.img.on('dragend', snapToHex)
	parent.add(u.img)
}
export function placeRdtr(u, rc, parent) {
	place(u, rdtrToHex(rc), parent)
}
// This function should be called after the user has placed a unit,
// for instance from 'dragend'.
export function snapToHex(e) {
	let img = e.target
	// Get the unit object from the image
	let u = fromImage(img)
	// The unit img coordinate is top-left, adjust to center
	let pos = {x:img.x() + imageOffset, y:img.y() + imageOffset}
	// Get the hex, and update the unit object
	hex = pixelToHex(pos)
	u.hex = hex
	// Snap!
	pos = pixelPos(hex)		// adjusted pos
	if (isStack(hex)) pos = stackAdjust(pos)
	img.position(pos)
}
function posEqual(a, b) {
	if (a.x != b.x) return false
	if (a.y != b.y) return false
	return true
}
function isStack(hex) {
	let unitCount = 0
	for (u of units) {
		if (u.hex && posEqual(u.hex, hex)) {
			unitCount++
			if (unitCount > 1) return true
		}
	}
	return false
}
function stackAdjust(pos) {
	let offset = 4
	return {x:pos.x - offset, y:pos.y - offset}
}

// ----------------------------------------------------------------------
// Unit Box
// A draggable shaded box with units (prototype in "deployment-demo.js")
// TODO: move UnitBox to "units.js"?

// A traditional "close" button
export const X = newImage()
X.src = "data:image\/svg+xml,<svg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" xmlns=\"http://www.w3.org/2000/svg\"> <rect x=\"2\" y=\"2\" width=\"76\" height=\"76\" fill=\"none\" stroke=\"white\" stroke-width=\"4\"/> <path d=\"M 15 15 L 65 65 M 15 65 L 65 15\" stroke=\"white\" stroke-width=\"10\" fill=\"none\"/> </svg>"

// Singelton for now
let theUnitBox

// Re-define to avoid cyclic dependency to rdtr.js
function moveToTop(e) {
	e.target.moveToTop()
}

export class UnitBox {
	rows = 1
	cols = 4
	x = 400
	y = 100
	text = "Units"
	board			// "this" and dragged units are placed on this layer
	box
	#sizeC = 60
	#sizeR = 70
	#offsetX = 20
	#offsetY = 50
	#units = new Set()
	constructor(obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				this[prop] = obj[prop];
			}
		}
		if (theUnitBox) {
			alert("Multiple UnitBox'es NOT allowed")
			return
		}
		theUnitBox = this
		// We want the pop-up box to be visible on screen even if the
		// board is dragged. So, compensate for the board position
		let pos = this.board.position()
		this.box = new Konva.Group({
			x: this.x - pos.x,
			y: this.y - pos.y,
			draggable: true,
		})
		this.box.on('dragstart', moveToTop)
		let width = this.cols * this.#sizeC + this.#offsetX
		this.box.add(new Konva.Rect({
			x: 0,
			y: 0,
			width: width,
			height: this.rows * this.#sizeR + this.#offsetY,
			fill: 'gray',
			opacity: 0.75,
			cornerRadius: 20,
		}))
		let close = new Konva.Image({
			x: width - 40,
			y: 15,
			image: X,
			scale: {x:0.3,y:0.3},
		})
		this.box.add(close)
		close.on('click', UnitBox.#destroy)
		this.box.add(new Konva.Text({
			x: 25,
			y: 15,
			fontSize: 22,
			fill: 'white',
			text: this.text
		}))
		this.board.add(this.box)
	}
	destroy() {
		// Clear the singleton reference
		theUnitBox = null
		// Hide the group object
		this.box.hide()
		// remove all remaining unit images from the group
		for (const u of this.#units) {
			u.img.remove()
		}
		this.#units.clear()	  // (prevent memory leak)
		// then destroy the group (and all remaining childs)
		// It is assumed that all eventHandlers are deleted too
		this.box.destroy()
	}
	// This is a 'click' event callback
	static #destroy(e) {
		theUnitBox.destroy()
	}
	static #dragstart(e) {
		theUnitBox.place(e)
	}
	place(e) {
		e.target.moveTo(this.board)
		e.target.moveToTop()
		e.target.on('dragend', snapToHex)
		// replace myself! NOTE: you *must* 'off' the old callback!!
		e.target.off('dragstart')
		e.target.on('dragstart', moveToTop)
		let u = fromImage(e.target)
		this.#units.delete(u)
	}
	addUnit(u, col, row) {
		if (u.hex) {
			let str = toStr(u)
			return
		}
		if (this.#units.has(u)) return // already added
		this.#units.add(u)
		u.img.on('dragstart', UnitBox.#dragstart)
		let x = col * this.#sizeC + this.#offsetX
		let y = row * this.#sizeR + this.#offsetY
		u.img.x(x)
		u.img.y(y)
		this.box.add(u.img)
	}
}

// Shows all "allowable" units for all major powers + neutrals (optional)
// Intended for initial deployment and later buys
export class UnitBoxMajor extends UnitBox {
	#brpText
	#brp = 0
	constructor(obj) {
		// ge,it,uk,su,fr,us,nu*
		// * either: neutrals OR a "BRP Cost:" text-item
		obj.rows = 7
		// inf,inf,inf,pz,pz,pz,res,par,air,air,nav,mec
		obj.cols = 12
		super(obj)

		for (const u of units) {
			if (u.allowable) {
				let rc = UnitBoxMajor.getRowCol(u)
				super.addUnit(u, rc.col, rc.row)
			}
			if (obj.neutrals) {
				if (u.nat == 'nu' && u.type != 'bh') {
					let rc = UnitBoxMajor.getRowCol(u)
					super.addUnit(u, rc.col, rc.row)
				}
			}
		}
		if (!obj.neutrals) {
			// (position hard-coded since #sizeR, etc. are private)
			this.#brpText = new Konva.Text({
				x: 20,
				y: 490,
				fontSize: 32,
				fontStyle: 'bold',
				fill: 'white',
				text: "BRP cost: 0",
			})
			this.box.add(this.#brpText)
		}
	}
	// This function overrides place() in the base class
	place(e) {
		if (this.#brpText) {
			let multiplier = 0
			let u = fromImage(e.target)
			switch (u.type) {
			case "inf":
			case "res":
				multiplier = 1
				break
			case "pz":
				multiplier = 2
				break
			case "par":
			case "air":
			case "nav":
				multiplier = 3
				break
			}
			this.#brp += u.s * multiplier
			this.#brpText.text(`BRP Cost: ${this.#brp}`)
		}
		super.place(e)
	}
	static #layout = {
		ge: {
			row: 0,
			col: [
				{type: 'inf', s:3},
				{type: 'pz', s:4},
				{type: 'res'},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
				{type: 'pz'},
				{type: 'inf'},
				{type: 'mec'},
			]
		},
		it: {
			row: 1,
			col: [
				{type: 'inf', s:3},
				{type: 'inf', s:2},
				{type: 'inf'},
				{type: 'pz'},
				{type: 'res'},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
			]
		},
		uk: {
			row: 2,
			col: [
				{type: 'inf', s:3},
				{type: 'inf', s:1},
				{type: 'inf'},
				{type: 'pz', s:4},
				{type: 'pz'},
				{type: 'res'},
				{type: 'air', s:5},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
				{type: 'mec'},
			]
		},
		su: {
			row: 3,
			col: [
				{type: 'inf', s:3},
				{type: 'inf', s:1},
				{type: 'inf'},
				{type: 'pz', s:4, m:5},
				{type: 'pz',s:3},
				{type: 'res'},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
				{type: 'mec'},
				{type: 'pz'},
			]
		},
		fr: {
			row: 4,
			col: [
				{type: 'inf', s:2},
				{type: 'inf'},
				{type: 'pz'},
				{type: 'res'},
				{type: 'par'},
				{type: 'air'},
				{type: 'nav'},
			]
		},
		us: {
			row: 5,
			col: [
				{type: 'inf'},
				{type: 'pz'},
				{type: 'res'},
				{type: 'air'},
				{type: 'nav'},
				{type: 'par'},
			]
		},
		nu: {
			row: 6,
			col: [
				{type: 'inf', s:2},
				{type: 'inf'},
				{type: 'air'},
			]
		},
	}
	// (to make this static allows unit-test)
	static getRowCol(u) {
		let l = UnitBoxMajor.#layout[u.nat]
		let col
		for (col = 0; col < l.col.length; col++) {
			let t = l.col[col]
			if (u.type != t.type) continue
			if (!t.s) break
			if (u.s != t.s) continue
			if (!t.m) break
			if (u.m != t.m) continue
			break
		}
		return {col:col, row:l.row}
	}
}


export class UnitBoxNeutrals extends UnitBox {
	constructor(obj) {
		// nu+iq+bh, sp+tu, fin+bulg, rum+hun
		obj.rows = 4
		// sp+tu: inf,pz,air,nav,(blank),inf,pz,air,nav
		obj.cols = 9
		obj.text = "Neutrals and Minor Allies"
		super(obj)

		for (const u of units) {
			if (!Object.keys(UnitBoxNeutrals.#layout).includes(u.nat)) continue
			if (u.hex) continue
			let rc = UnitBoxNeutrals.getRowCol(u)
			super.addUnit(u, rc.col, rc.row)
		}
	}
	static #layout = {
		nu: {
			row: 0,
			col: [
				{type: 'inf', s:2, col: 0},
				{type: 'inf', col: 1},
				{type: 'air', col: 2},
				{type: 'nav', col: 3},
				{type: 'bh', col: 8},
			]
		},
		iq: {
			row: 0,
			col: [
				{type: 'inf', col: 7},
			]
		},
		sp: {
			row: 1,
			col: [
				{type: 'inf', col: 0},
				{type: 'pz', col: 1},
				{type: 'air', col: 2},
				{type: 'nav', col: 3},
			]
		},
		tu: {
			row: 1,
			col: [
				{type: 'inf', col: 5},
				{type: 'pz', col: 6},
				{type: 'air', col: 7},
				{type: 'nav', col: 8},
			]
		},
		fi: {
			row: 2,
			col: [
				{type: 'inf', col: 0},
				{type: 'air', col: 1},
			]
		},
		bu: {
			row: 2,
			col: [
				{type: 'inf', col: 5},
				{type: 'air', col: 6},
			]
		},
		ru: {
			row: 3,
			col: [
				{type: 'inf', s:2, col: 0},
				{type: 'inf', col: 1},
				{type: 'air', col: 2},
			]
		},
		hu: {
			row: 3,
			col: [
				{type: 'inf', s:2, col: 5},
				{type: 'inf', col: 6},
				{type: 'air', col: 7},
			]
		},
	}
	// (to make this static allows unit-test)
	static getRowCol(u) {
		let l = UnitBoxNeutrals.#layout[u.nat]
		let t
		for (t of l.col) {
			if (u.type != t.type) continue
			if (!t.s) break
			if (u.s != t.s) continue
			break
		}
		return {col:t.col, row:l.row}
	}
}

// Shows all undployed air units for all major powers + air-bases
// Intended for break/buildup of 5-4 airs
export class UnitBoxAir extends UnitBox {
	constructor(obj) {
		// ge,it,uk,su,fr,us,nu*
		obj.rows = 6
		// 5-4, 3-4, 2-4, 1-4, ab
		obj.cols = 5
		obj.text = "Air Exchange"
		super(obj)

		for (const u of units) {
			if (!Object.keys(UnitBoxAir.#layout).includes(u.nat)) continue
			if (u.hex) continue
			if (u.type != "air" && u.type != "ab") continue
			if (u.s == 5 && !u.allowable) continue
			let rc = UnitBoxAir.getRowCol(u)
			super.addUnit(u, rc.col, rc.row)
		}
	}
	static #layout = {
		ge: { row: 0 },
		it: { row: 1 },
		uk: { row: 2 },
		su: { row: 3 },
		fr: { row: 4 },
		us: { row: 5 }
	}
	// (to make this static allows unit-test)
	static getRowCol(u) {
		let l = UnitBoxAir.#layout[u.nat]
		let col
		const colLayout = [
			{type: 'air', s:5},
			{type: 'air', s:3},
			{type: 'air', s:2},
			{type: 'air', s:1},
			{type: 'ab'},
		]
		for (col = 0; col < colLayout.length; col++) {
			let t = colLayout[col]
			if (u.type != t.type) continue
			if (!t.s) break
			if (u.s != t.s) continue
			break
		}
		return {col:col, row:l.row}
	}
}
// Shows all undployed naval units for all major powers
// Intended for break/buildup of 9-boats
export class UnitBoxNav extends UnitBox {
	constructor(obj) {
		// ge,it,uk,su,fr,us
		obj.rows = 6
		// 9,8,6,4,2,1
		obj.cols = 6
		obj.text = "Fleet Exchange"
		super(obj)

		for (const u of units) {
			if (!Object.keys(UnitBoxNav.#layout).includes(u.nat)) continue
			if (u.hex) continue
			if (u.type != "nav") continue
			if (u.s == 9 && !u.allowable) continue
			let rc = UnitBoxNav.getRowCol(u)
			super.addUnit(u, rc.col, rc.row)
		}
	}
	static #layout = {
		ge: { row: 0 },
		it: { row: 1 },
		uk: { row: 2 },
		su: { row: 3 },
		fr: { row: 4 },
		us: { row: 5 }
	}
	// (to make this static allows unit-test)
	static getRowCol(u) {
		let l = UnitBoxNav.#layout[u.nat]
		let col
		const colLayout = [
			{type: 'nav', s:9},
			{type: 'nav', s:8},
			{type: 'nav', s:6},
			{type: 'nav', s:4},
			{type: 'nav', s:2},
			{type: 'nav'},
		]
		for (col = 0; col < colLayout.length; col++) {
			let t = colLayout[col]
			if (u.type != t.type) continue
			if (!t.s) break
			if (u.s != t.s) continue
			break
		}
		return {col:col, row:l.row}
	}
}

