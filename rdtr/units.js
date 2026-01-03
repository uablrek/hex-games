// SPDX-License-Identifier: ISC

import Konva from 'konva';

const scale = 0.4;
const side = 150;

class Unit {
	rows = 8;
	cols = 14;
	layout;
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
		return {x: x0 + (side + gapX) * x, y: y0 + (side + gapY) * y };
	}
	image(x, y, id) {
		var tl = this.#topLeft(x, y);
		return this.sheet.clone({
			id: id,
			width: side,
			height: side,
			crop: { x: tl.x, y: tl.y, width: side, height: side },
			scale: { x: scale, y: scale},
			cornerRadius: 16,
			draggable: true
		});
	}
}

//import ussrData from './tr-counters-ussr.png'
ussrData = './tr-counters-ussr.png'
ussr = new Unit({
	imgData: ussrData,
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
});

//import germanyData from './tr-counters-germany.png'
germanyData = './tr-counters-germany.png'
germany = new Unit({
	imgData: germanyData,
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
});

//import frData from './tr-counters-fr-usa.png'
frData = './tr-counters-fr-usa.png'
fr = new Unit({
	imgData: frData,
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
});

//import italyData from './tr-counters-italy.png'
italyData = './tr-counters-italy.png'
italy = new Unit({
	imgData: italyData,
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
});

//import ukData from './tr-counters-uk.png'
ukData = './tr-counters-uk.png'
uk = new Unit({
	imgData: ukData,
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
});

//import variantData from './tr-counters-variant.png'
variantData = './tr-counters-variant.png'
variant = new Unit({
	imgData: variantData,
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
});

// { sheet:fr, pos:{x:,y:}, type:"inf", nat: "fr", m:2, s:3, lbl:"8",
//   img:Image, map:{r:,d:}}
const units = [
	{sheet:fr, pos:{x:0,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"Alp"},
	{sheet:fr, pos:{x:1,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"Col"},
	{sheet:fr, pos:{x:2,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"6"},
	{sheet:fr, pos:{x:3,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"7"},
	{sheet:fr, pos:{x:4,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"8"},
	{sheet:fr, pos:{x:5,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"10"},
	{sheet:fr, pos:{x:6,y:0}, type:"inf", nat: "fr", m:3, s:2, lbl:"11"},
	{sheet:fr, pos:{x:0,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"13"},
	{sheet:fr, pos:{x:1,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"17"},
	{sheet:fr, pos:{x:2,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"16"},
	{sheet:fr, pos:{x:3,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"18"},
	{sheet:fr, pos:{x:4,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"24"},
	{sheet:fr, pos:{x:5,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"25"},
	{sheet:fr, pos:{x:6,y:1}, type:"inf", nat: "fr", m:3, s:2, lbl:"42"},
	{sheet:fr, pos:{x:0,y:2}, type:"inf", nat: "fr", m:3, s:2, lbl:"44"},
	{sheet:fr, pos:{x:1,y:2}, type:"inf", nat: "fr", m:3, s:2, lbl:"45"},
	{sheet:fr, pos:{x:2,y:2}, type:"pz",  nat: "fr", m:5, s:3, lbl:"1"},
	{sheet:fr, pos:{x:3,y:2}, type:"pz",  nat: "fr", m:5, s:3, lbl:"2GCM"},
	{sheet:fr, pos:{x:4,y:2}, type:"pz",  nat: "fr", m:5, s:3, lbl:"5GCM"},
	{sheet:fr, pos:{x:5,y:2}, type:"air", nat: "fr", m:4, s:5},
	{sheet:fr, pos:{x:6,y:2}, type:"air", nat: "fr", m:4, s:5},
	{sheet:fr, pos:{x:0,y:3}, type:"nav", nat: "fr", s:9},
	{sheet:fr, pos:{x:1,y:3}, type:"nav", nat: "fr", s:9},
	{sheet:fr, pos:{x:2,y:3}, type:"nav", nat: "fr", s:9},
	{sheet:fr, pos:{x:3,y:3}, type:"res", nat: "fr", s:1},
	{sheet:fr, pos:{x:4,y:3}, type:"res", nat: "fr", s:1},
	{sheet:fr, pos:{x:5,y:3}, type:"res", nat: "fr", s:1},
	{sheet:fr, pos:{x:6,y:3}, type:"res", nat: "fr", s:1},
	{sheet:fr, pos:{x:0,y:4}, type:"air", nat: "fr", s:3, m:4},
	{sheet:fr, pos:{x:1,y:4}, type:"air", nat: "fr", s:3, m:4},
	{sheet:fr, pos:{x:2,y:4}, type:"air", nat: "fr", s:2, m:4},
	{sheet:fr, pos:{x:3,y:4}, type:"air", nat: "fr", s:1, m:4},
	{sheet:fr, pos:{x:4,y:4}, type:"air", nat: "fr", s:1, m:4},
	{sheet:fr, pos:{x:5,y:4}, type:"nav", nat: "fr", s:8},
	{sheet:fr, pos:{x:6,y:4}, type:"nav", nat: "fr", s:8},
	{sheet:fr, pos:{x:0,y:5}, type:"nav", nat: "fr", s:6},
	{sheet:fr, pos:{x:1,y:5}, type:"nav", nat: "fr", s:6},
	{sheet:fr, pos:{x:2,y:5}, type:"nav", nat: "fr", s:4},
	{sheet:fr, pos:{x:3,y:5}, type:"nav", nat: "fr", s:4},
	{sheet:fr, pos:{x:4,y:5}, type:"nav", nat: "fr", s:2},
	{sheet:fr, pos:{x:5,y:5}, type:"nav", nat: "fr", s:2},
	{sheet:fr, pos:{x:6,y:5}, type:"nav", nat: "fr", s:1},
	{sheet:fr, pos:{x:0,y:6}, type:"nav", nat: "fr", s:1},
	{sheet:fr, pos:{x:4,y:6}, type:"ab", nat: "fr"},
	{sheet:fr, pos:{x:5,y:6}, type:"ab", nat: "fr"},
	{sheet:fr, pos:{x:6,y:6}, type:"ab", nat: "fr"},
	{sheet:fr, pos:{x:0,y:7}, type:"air", nat: "us", s:1, m:4},
	{sheet:fr, pos:{x:1,y:7}, type:"air", nat: "us", s:1, m:4},
	{sheet:fr, pos:{x:2,y:7}, type:"air", nat: "us", s:1, m:4},
	{sheet:fr, pos:{x:3,y:7}, type:"ab", nat: "us"},
	{sheet:fr, pos:{x:4,y:7}, type:"ab", nat: "us"},
	{sheet:fr, pos:{x:5,y:7}, type:"ab", nat: "us"},
	{sheet:fr, pos:{x:7,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"2"},
	{sheet:fr, pos:{x:8,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"3"},
	{sheet:fr, pos:{x:9,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"4"},
	{sheet:fr, pos:{x:10,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"5"},
	{sheet:fr, pos:{x:11,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"6"},
	{sheet:fr, pos:{x:12,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"8"},
	{sheet:fr, pos:{x:13,y:0}, type:"inf", nat: "us", s:3, m:4, lbl:"10"},
	{sheet:fr, pos:{x:7,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"12"},
	{sheet:fr, pos:{x:8,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"19"},
	{sheet:fr, pos:{x:9,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"21"},
	{sheet:fr, pos:{x:10,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"22"},
	{sheet:fr, pos:{x:11,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"23"},
	{sheet:fr, pos:{x:12,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"25b"},
	{sheet:fr, pos:{x:13,y:1}, type:"inf", nat: "us", s:3, m:4, lbl:"26b"},
	{sheet:fr, pos:{x:7,y:2}, type:"inf", nat: "us", s:3, m:4, lbl:"27b"},
	{sheet:fr, pos:{x:8,y:2}, type:"par", nat: "us", s:3, m:3, lbl:"18AB"},
	{sheet:fr, pos:{x:9,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"1"},
	{sheet:fr, pos:{x:10,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"7"},
	{sheet:fr, pos:{x:11,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"13"},
	{sheet:fr, pos:{x:12,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"16"},
	{sheet:fr, pos:{x:13,y:2}, type:"pz", nat: "us", s:5, m:6, lbl:"20"},
	{sheet:fr, pos:{x:7,y:3}, type:"res", nat: "us", s:1},
	{sheet:fr, pos:{x:8,y:3}, type:"res", nat: "us", s:1},
	{sheet:fr, pos:{x:9,y:3}, type:"res", nat: "us", s:1},
	{sheet:fr, pos:{x:10,y:3}, type:"res", nat: "us", s:1},
	{sheet:fr, pos:{x:11,y:3}, type:"res", nat: "us", s:1},
	{sheet:fr, pos:{x:12,y:3}, type:"res", nat: "us", s:1},
	{sheet:fr, pos:{x:13,y:3}, type:"res", nat: "us", s:1},
	{sheet:fr, pos:{x:7,y:4}, type:"nav", nat: "us", s:9},
	{sheet:fr, pos:{x:8,y:4}, type:"nav", nat: "us", s:9},
	{sheet:fr, pos:{x:9,y:4}, type:"nav", nat: "us", s:9},
	{sheet:fr, pos:{x:10,y:4}, type:"nav", nat: "us", s:9},
	{sheet:fr, pos:{x:11,y:4}, type:"nav", nat: "us", s:9},
	{sheet:fr, pos:{x:12,y:4}, type:"nav", nat: "us", s:9},
	{sheet:fr, pos:{x:13,y:4}, type:"nav", nat: "us", s:9},
	{sheet:fr, pos:{x:7,y:5}, type:"nav", nat: "us", s:9},
	{sheet:fr, pos:{x:8,y:5}, type:"nav", nat: "us", s:9},
	{sheet:fr, pos:{x:9,y:5}, type:"nav", nat: "us", s:6},
	{sheet:fr, pos:{x:10,y:5}, type:"nav", nat: "us", s:6},
	{sheet:fr, pos:{x:11,y:5}, type:"nav", nat: "us", s:4},
	{sheet:fr, pos:{x:12,y:5}, type:"nav", nat: "us", s:4},
	{sheet:fr, pos:{x:13,y:5}, type:"nav", nat: "us", s:2},
	{sheet:fr, pos:{x:7,y:6}, type:"nav", nat: "us", s:8},
	{sheet:fr, pos:{x:8,y:6}, type:"nav", nat: "us", s:8},
	{sheet:fr, pos:{x:9,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:fr, pos:{x:10,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:fr, pos:{x:11,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:fr, pos:{x:12,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:fr, pos:{x:13,y:6}, type:"air", nat: "us", s:5, m:4},
	{sheet:fr, pos:{x:7,y:7}, type:"nav", nat: "us", s:2},
	{sheet:fr, pos:{x:8,y:7}, type:"nav", nat: "us", s:1},
	{sheet:fr, pos:{x:9,y:7}, type:"nav", nat: "us", s:1},
	{sheet:fr, pos:{x:10,y:7}, type:"air", nat: "us", s:3, m:4},
	{sheet:fr, pos:{x:11,y:7}, type:"air", nat: "us", s:3, m:4},
	{sheet:fr, pos:{x:12,y:7}, type:"air", nat: "us", s:2, m:4},
	{sheet:fr, pos:{x:13,y:7}, type:"air", nat: "us", s:2, m:4},
	{sheet:ussr, pos:{x:0,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"2 Gds"},
	{sheet:ussr, pos:{x:1,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"3 Gds"},
	{sheet:ussr, pos:{x:2,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"5 Gds"},
	{sheet:ussr, pos:{x:3,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"6 Gds"},
	{sheet:ussr, pos:{x:4,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"7 Gds"},
	{sheet:ussr, pos:{x:5,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"8 Gds"},
	{sheet:ussr, pos:{x:6,y:0}, type:"inf", nat: "su", s:3, m:3, lbl:"11 Gds"},
	{sheet:ussr, pos:{x:0,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"1 Shk"},
	{sheet:ussr, pos:{x:1,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"2 Shk"},
	{sheet:ussr, pos:{x:2,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"3 Shk"},
	{sheet:ussr, pos:{x:3,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"5 Shk"},
	{sheet:ussr, pos:{x:4,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"Nav"},
	{sheet:ussr, pos:{x:5,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"53"},
	{sheet:ussr, pos:{x:6,y:1}, type:"inf", nat: "su", s:3, m:3, lbl:"57"},
	{sheet:ussr, pos:{x:0,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"60"},
	{sheet:ussr, pos:{x:1,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"61"},
	{sheet:ussr, pos:{x:2,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"62"},
	{sheet:ussr, pos:{x:3,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"63"},
	{sheet:ussr, pos:{x:4,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"64"},
	{sheet:ussr, pos:{x:5,y:2}, type:"inf", nat: "su", s:3, m:3, lbl:"70"},
	{sheet:ussr, pos:{x:6,y:2}, type:"par", nat: "su", s:2, m:3, lbl:"1 Pr"},
	{sheet:ussr, pos:{x:0,y:3}, type:"par", nat: "su", s:2, m:3, lbl:"2 Pr"},
	{sheet:ussr, pos:{x:1,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"3"},
	{sheet:ussr, pos:{x:2,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"4"},
	{sheet:ussr, pos:{x:3,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"5"},
	{sheet:ussr, pos:{x:4,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"6"},
	{sheet:ussr, pos:{x:5,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"7"},
	{sheet:ussr, pos:{x:6,y:3}, type:"inf", nat: "su", s:2, m:3, lbl:"8"},
	{sheet:ussr, pos:{x:0,y:4}, type:"inf", nat: "su", s:2, m:3, lbl:"9"},
	{sheet:ussr, pos:{x:1,y:4}, type:"inf", nat: "su", s:2, m:3, lbl:"10"},
	{sheet:ussr, pos:{x:2,y:4}, type:"inf", nat: "su", s:2, m:3, lbl:"11"},
	{sheet:ussr, pos:{x:3,y:4}, type:"inf", nat: "su", s:2, m:3, lbl:"12"},
	{sheet:ussr, pos:{x:4,y:4}, type:"inf", nat: "su", s:1, m:3, lbl:"13"},
	{sheet:ussr, pos:{x:5,y:4}, type:"inf", nat: "su", s:1, m:3, lbl:"14"},
	{sheet:ussr, pos:{x:6,y:4}, type:"inf", nat: "su", s:1, m:3, lbl:"16"},
	{sheet:ussr, pos:{x:0,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"18"},
	{sheet:ussr, pos:{x:1,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"19"},
	{sheet:ussr, pos:{x:2,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"20"},
	{sheet:ussr, pos:{x:3,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"21"},
	{sheet:ussr, pos:{x:4,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"22"},
	{sheet:ussr, pos:{x:5,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"23"},
	{sheet:ussr, pos:{x:6,y:5}, type:"inf", nat: "su", s:1, m:3, lbl:"24"},
	{sheet:ussr, pos:{x:0,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"26"},
	{sheet:ussr, pos:{x:1,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"27"},
	{sheet:ussr, pos:{x:2,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"28"},
	{sheet:ussr, pos:{x:3,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"29"},
	{sheet:ussr, pos:{x:4,y:6}, type:"inf", nat: "su", s:1, m:3, lbl:"30"},
	{sheet:ussr, pos:{x:5,y:6}, type:"pz", nat: "su", s:3, m:5, lbl:"3 Me"},
	{sheet:ussr, pos:{x:6,y:6}, type:"pz", nat: "su", s:3, m:5, lbl:"11 Tk"},
	{sheet:ussr, pos:{x:0,y:7}, type:"pz", nat: "su", s:3, m:5, lbl:"13 Me"},
	{sheet:ussr, pos:{x:1,y:7}, type:"pz", nat: "su", s:3, m:5, lbl:"15 Me"},
	{sheet:ussr, pos:{x:2,y:7}, type:"pz", nat: "su", s:3, m:5, lbl:"19 Me"},
	{sheet:ussr, pos:{x:3,y:7}, type:"pz", nat: "su", s:3, m:5, lbl:"22 Me"},
	{sheet:ussr, pos:{x:4,y:7}, type:"air", nat: "su", s:5, m:4},
	{sheet:ussr, pos:{x:5,y:7}, type:"air", nat: "su", s:5, m:4},
	{sheet:ussr, pos:{x:6,y:7}, type:"air", nat: "su", s:5, m:4},
	{sheet:ussr, pos:{x:7,y:0}, type:"pz", nat: "su", s:4, m:5, lbl:"1 Tk"},
	{sheet:ussr, pos:{x:8,y:0}, type:"pz", nat: "su", s:4, m:5, lbl:"2 Tk"},
	{sheet:ussr, pos:{x:9,y:0}, type:"pz", nat: "su", s:4, m:5, lbl:"3 Tk"},
	{sheet:ussr, pos:{x:10,y:0}, type:"pz", nat: "su", s:4, m:5, lbl:"5 Tk"},
	{sheet:ussr, pos:{x:11,y:0}, type:"nav", nat: "su", s:9},
	{sheet:ussr, pos:{x:12,y:0}, type:"nav", nat: "su", s:9},
	{sheet:ussr, pos:{x:13,y:0}, type:"nav", nat: "su", s:9},
	{sheet:variant, pos:{x:0,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"1"},
	{sheet:variant, pos:{x:1,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"2"},
	{sheet:variant, pos:{x:2,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"3"},
	{sheet:variant, pos:{x:3,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"4"},
	{sheet:variant, pos:{x:4,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"5"},
	{sheet:variant, pos:{x:5,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"6"},
	{sheet:variant, pos:{x:6,y:0}, type:"inf", nat:"tu", s:2, m:3, lbl:"7"},	
	{sheet:variant, pos:{x:0,y:1}, type:"pz", nat:"tu", s:2, m:5, lbl:"1"},
	{sheet:variant, pos:{x:1,y:1}, type:"pz", nat:"tu", s:2, m:5, lbl:"2"},
	{sheet:variant, pos:{x:2,y:1}, type:"air", nat:"tu", s:2, m:4, lbl:"Turk"},
	{sheet:variant, pos:{x:3,y:1}, type:"air", nat:"tu", s:2, m:4, lbl:"Turk"},
	{sheet:variant, pos:{x:4,y:1}, type:"nav", nat:"tu", s:2},
	{sheet:variant, pos:{x:5,y:1}, type:"nav", nat:"tu", s:2},
	{sheet:variant, pos:{x:6,y:1}, type:"nav", nat:"tu", s:2},
	{sheet:variant, pos:{x:0,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Galicia"},
	{sheet:variant, pos:{x:1,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Castilla"},
	{sheet:variant, pos:{x:2,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Aragon"},
	{sheet:variant, pos:{x:3,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Navarr"},
	{sheet:variant, pos:{x:4,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Granad"},
	{sheet:variant, pos:{x:5,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Cordob"},
	{sheet:variant, pos:{x:6,y:2}, type:"inf", nat:"sp", s:2, m:3, lbl:"Andalu"},
	{sheet:variant, pos:{x:0,y:3}, type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{sheet:variant, pos:{x:0,y:3}, type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{sheet:variant, pos:{x:0,y:3}, type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{sheet:variant, pos:{x:3,y:3}, type:"nav", nat:"sp", s:2},
	{sheet:variant, pos:{x:3,y:3}, type:"nav", nat:"sp", s:2},
	{sheet:variant, pos:{x:3,y:3}, type:"nav", nat:"sp", s:2},
	{sheet:variant, pos:{x:3,y:3}, type:"nav", nat:"sp", s:2},
	{sheet:variant, pos:{x:0,y:4}, type:"pz", nat:"sp", s:2, m:5, lbl:"Madrid"},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:5}, type:"inf", nat:"nu", s:1, m:3},
	{sheet:variant, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:variant, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:variant, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:variant, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:variant, pos:{x:0,y:6}, type:"inf", nat:"nu", s:2, m:3},
	{sheet:variant, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:variant, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:variant, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:variant, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:variant, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:variant, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:variant, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:variant, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:variant, pos:{x:3,y:4}, type:"air", nat:"nu", s:2, m:4},
	{sheet:variant, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:variant, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:variant, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:variant, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:variant, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:variant, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:variant, pos:{x:4,y:4}, type:"air", nat:"nu", s:1, m:4},
	{sheet:variant, pos:{x:1,y:4}, type:"nav", nat:"nu", s:2},
	{sheet:variant, pos:{x:1,y:4}, type:"nav", nat:"nu", s:2},
	{sheet:variant, pos:{x:7,y:0}, type:"pz", nat:"it", s:2, m:5, lbl:"Maletti"},
	{sheet:variant, pos:{x:9,y:0}, type:"inf", nat:"it", s:3, m:3, lbl:"Centauro"},
	{sheet:variant, pos:{x:10,y:0}, type:"inf", nat:"it", s:3, m:3, lbl:"Freccia"},
	{sheet:variant, pos:{x:7,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"1 Iraq"},
	{sheet:variant, pos:{x:8,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"2 Iraq"},
	{sheet:variant, pos:{x:9,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"3 Iraq"},
	{sheet:variant, pos:{x:11,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"4 Iraq"},
	{sheet:variant, pos:{x:12,y:1}, type:"inf", nat:"iq", s:1, m:3, lbl:"5 Iraq"},
	{sheet:variant, pos:{x:11,y:1}, type:"air", nat:"iq", s:2, m:4, lbl:"5 Iraq"},
	{sheet:variant, pos:{x:7,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"49"},
	{sheet:variant, pos:{x:8,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"50"},
	{sheet:variant, pos:{x:9,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"56"},
	{sheet:variant, pos:{x:10,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"66"},
	{sheet:variant, pos:{x:11,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"79"},
	{sheet:variant, pos:{x:12,y:2}, type:"mec", nat:"ge", s:2, m:6, lbl:"81"},
	{sheet:variant, pos:{x:7,y:3}, type:"par", nat:"ge", s:3, m:3, lbl:"2 Fsjr"},
	{sheet:variant, pos:{x:8,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"Sp SS"},
	{sheet:variant, pos:{x:9,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"Tu SS"},
	{sheet:variant, pos:{x:10,y:3}, type:"inf", nat:"ge", s:1, m:3, lbl:"1 Fr SS"},
	{sheet:variant, pos:{x:11,y:3}, type:"inf", nat:"ge", s:1, m:3, lbl:"2 Fr SS"},
	{sheet:variant, pos:{x:12,y:3}, type:"inf", nat:"ge", s:1, m:3, lbl:"Croat SS"},
	{sheet:variant, pos:{x:7,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"1 Alg"},
	{sheet:variant, pos:{x:8,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"2 Alg"},
	{sheet:variant, pos:{x:9,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"3 Alg"},
	{sheet:variant, pos:{x:10,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"1 Mor"},
	{sheet:variant, pos:{x:11,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"2 Mor"},
	{sheet:variant, pos:{x:12,y:4}, type:"inf", nat:"fr", s:1, m:3, lbl:"1 Tun"},
	{sheet:variant, pos:{x:13,y:4}, type:"pz", nat:"fr", s:3, m:5, lbl:"1 GCM"},
	{sheet:variant, pos:{x:7,y:5}, type:"pz", nat:"fr", s:3, m:5, lbl:"3 GCM"},
	{sheet:variant, pos:{x:8,y:5}, type:"pz", nat:"fr", s:3, m:5, lbl:"4 GCM"},
	{sheet:variant, pos:{x:7,y:6}, type:"mec", nat:"uk", s:2, m:5, lbl:"Egypt"},
	{sheet:variant, pos:{x:8,y:6}, type:"mec", nat:"uk", s:2, m:5, lbl:"Palest"},
	{sheet:variant, pos:{x:9,y:6}, type:"mec", nat:"uk", s:2, m:5, lbl:"Malta"},
	{sheet:variant, pos:{x:10,y:6}, type:"inf", nat:"uk", s:2, m:3, lbl:"Egypt"},
	{sheet:variant, pos:{x:11,y:6}, type:"inf", nat:"uk", s:2, m:3, lbl:"Palest"},
	{sheet:variant, pos:{x:12,y:6}, type:"inf", nat:"uk", s:2, m:3, lbl:"Malta"},
	{sheet:italy, pos:{x:7,y:3}, type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{sheet:italy, pos:{x:7,y:3}, type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{sheet:italy, pos:{x:7,y:3}, type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{sheet:italy, pos:{x:7,y:3}, type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{sheet:italy, pos:{x:11,y:3}, type:"air", nat:"bu", s:1, m:4, lbl:"Bulg"},
	{sheet:italy, pos:{x:12,y:3}, type:"inf", nat:"ru", s:2, m:3, lbl:"Rum"},
	{sheet:italy, pos:{x:12,y:3}, type:"inf", nat:"ru", s:2, m:3, lbl:"Rum"},
	{sheet:italy, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:italy, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:italy, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:italy, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:italy, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:italy, pos:{x:7,y:4}, type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{sheet:italy, pos:{x:13,y:4}, type:"air", nat:"ru", s:1, m:4, lbl:"Rum"},
	{sheet:italy, pos:{x:7,y:5}, type:"inf", nat:"hu", s:2, m:3, lbl:"Hun"},
	{sheet:italy, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:italy, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:italy, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:italy, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:italy, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:italy, pos:{x:8,y:5}, type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{sheet:italy, pos:{x:7,y:6}, type:"air", nat:"hu", s:1, m:4, lbl:"Hun"},
	{sheet:italy, pos:{x:8,y:6}, type:"air", nat:"fi", s:1, m:4, lbl:"Finn"},
	{sheet:italy, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:italy, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:italy, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:italy, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:italy, pos:{x:9,y:6}, type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{sheet:italy, pos:{x:0,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"5"},
	{sheet:italy, pos:{x:1,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"8"},
	{sheet:italy, pos:{x:2,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"10"},
	{sheet:italy, pos:{x:3,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"12"},
	{sheet:italy, pos:{x:4,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"11"},
	{sheet:italy, pos:{x:5,y:0}, type:"inf", nat:"it", s:2, m:3, lbl:"CN"},
	{sheet:italy, pos:{x:6,y:0}, type:"inf", nat:"it", s:3, m:3, lbl:"Celere"},
	{sheet:italy, pos:{x:0,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"Libya"},
	{sheet:italy, pos:{x:1,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"14"},
	{sheet:italy, pos:{x:2,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"16"},
	{sheet:italy, pos:{x:3,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"17"},
	{sheet:italy, pos:{x:4,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"20"},
	{sheet:italy, pos:{x:5,y:1}, type:"inf", nat:"it", s:1, m:3, lbl:"35"},
	{sheet:italy, pos:{x:6,y:1}, type:"inf", nat:"it", s:3, m:3, lbl:"Alpini"},
	{sheet:italy, pos:{x:0,y:2}, type:"par", nat:"it", s:2, m:3, lbl:"Fologre"},
	{sheet:italy, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:italy, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:italy, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:italy, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:italy, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:italy, pos:{x:1,y:2}, type:"res", nat:"it", s:1},
	{sheet:italy, pos:{x:0,y:3}, type:"pz", nat:"it", s:2, m:5, lbl:"1"},
	{sheet:italy, pos:{x:1,y:3}, type:"pz", nat:"it", s:2, m:5, lbl:"2"},
	{sheet:italy, pos:{x:2,y:3}, type:"pz", nat:"it", s:2, m:5, lbl:"21"},
	{sheet:italy, pos:{x:3,y:3}, type:"pz", nat:"it", s:2, m:5, lbl:"Celere"},
	{sheet:italy, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:italy, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:italy, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:italy, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:italy, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:italy, pos:{x:4,y:3}, type:"nav", nat:"it", s:9},
	{sheet:italy, pos:{x:3,y:4}, type:"air", nat:"it", s:5, m:4},
	{sheet:italy, pos:{x:3,y:4}, type:"air", nat:"it", s:5, m:4},
	{sheet:italy, pos:{x:3,y:4}, type:"air", nat:"it", s:5, m:4},
	{sheet:italy, pos:{x:0,y:5}, type:"ab", nat:"it"},
	{sheet:italy, pos:{x:0,y:5}, type:"ab", nat:"it"},
	{sheet:italy, pos:{x:0,y:5}, type:"ab", nat:"it"},
	{sheet:italy, pos:{x:4,y:5}, type:"nav", nat:"it", s:8},
	{sheet:italy, pos:{x:4,y:5}, type:"nav", nat:"it", s:8},
	{sheet:italy, pos:{x:6,y:5}, type:"nav", nat:"it", s:6},
	{sheet:italy, pos:{x:6,y:5}, type:"nav", nat:"it", s:6},
	{sheet:italy, pos:{x:1,y:6}, type:"nav", nat:"it", s:4},
	{sheet:italy, pos:{x:1,y:6}, type:"nav", nat:"it", s:4},
	{sheet:italy, pos:{x:2,y:6}, type:"nav", nat:"it", s:2},
	{sheet:italy, pos:{x:2,y:6}, type:"nav", nat:"it", s:2},
	{sheet:italy, pos:{x:5,y:6}, type:"nav", nat:"it", s:1},
	{sheet:italy, pos:{x:5,y:6}, type:"nav", nat:"it", s:1},
	{sheet:italy, pos:{x:0,y:7}, type:"air", nat:"it", s:3, m:4},
	{sheet:italy, pos:{x:0,y:7}, type:"air", nat:"it", s:3, m:4},
	{sheet:italy, pos:{x:2,y:7}, type:"air", nat:"it", s:2, m:4},
	{sheet:italy, pos:{x:2,y:7}, type:"air", nat:"it", s:2, m:4},
	{sheet:italy, pos:{x:4,y:7}, type:"air", nat:"it", s:1, m:4},
	{sheet:italy, pos:{x:7,y:0}, type:"air", nat:"ge", s:2, m:4},
	{sheet:italy, pos:{x:7,y:0}, type:"air", nat:"ge", s:2, m:4},
	{sheet:italy, pos:{x:7,y:0}, type:"air", nat:"ge", s:2, m:4},
	{sheet:italy, pos:{x:8,y:0}, type:"air", nat:"ge", s:3, m:4},
	{sheet:italy, pos:{x:8,y:0}, type:"air", nat:"ge", s:3, m:4},
	{sheet:italy, pos:{x:8,y:0}, type:"air", nat:"ge", s:3, m:4},
	{sheet:italy, pos:{x:8,y:0}, type:"air", nat:"ge", s:3, m:4},
	{sheet:uk, pos:{x:0,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"1 BEF"},
	{sheet:uk, pos:{x:1,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"2 BEF"},
	{sheet:uk, pos:{x:2,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"5"},
	{sheet:uk, pos:{x:3,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"8"},
	{sheet:uk, pos:{x:4,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"9"},
	{sheet:uk, pos:{x:5,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"12"},
	{sheet:uk, pos:{x:6,y:0}, type:"inf", nat:"uk", s:3, m:4, lbl:"2 Can"},
	{sheet:uk, pos:{x:0,y:1}, type:"inf", nat:"uk", s:1, m:3, lbl:"Egypt"},
	{sheet:uk, pos:{x:1,y:1}, type:"inf", nat:"uk", s:1, m:3, lbl:"Palest"},
	{sheet:uk, pos:{x:2,y:1}, type:"inf", nat:"uk", s:1, m:3, lbl:"Malta"},
	{sheet:uk, pos:{x:3,y:1}, type:"pz", nat:"uk", s:4, m:5, lbl:"13"},
	{sheet:uk, pos:{x:4,y:1}, type:"pz", nat:"uk", s:4, m:5, lbl:"30"},
	{sheet:uk, pos:{x:5,y:1}, type:"pz", nat:"uk", s:4, m:5, lbl:"1 Can"},
	{sheet:uk, pos:{x:6,y:1}, type:"pz", nat:"uk", s:4, m:5, lbl:"Polish"},
	{sheet:uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:uk, pos:{x:0,y:2}, type:"res", nat:"uk", s:1},
	{sheet:uk, pos:{x:6,y:2}, type:"par", nat:"uk", s:3, m:3, lbl:"1 AB"},
	{sheet:uk, pos:{x:0,y:3}, type:"pz", nat:"uk", s:2, m:5, lbl:"WDF"},
	{sheet:uk, pos:{x:1,y:3}, type:"air", nat:"uk", s:5, m:4},
	{sheet:uk, pos:{x:1,y:3}, type:"air", nat:"uk", s:5, m:4},
	{sheet:uk, pos:{x:1,y:3}, type:"air", nat:"uk", s:5, m:4},
	{sheet:uk, pos:{x:1,y:3}, type:"air", nat:"uk", s:5, m:4},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:0,y:4}, type:"nav", nat:"uk", s:9},
	{sheet:uk, pos:{x:1,y:5}, type:"ab", nat:"uk"},
	{sheet:uk, pos:{x:1,y:5}, type:"ab", nat:"uk"},
	{sheet:uk, pos:{x:1,y:5}, type:"ab", nat:"uk"},
	{sheet:uk, pos:{x:0,y:6}, type:"wnav", nat:"uk", s:1},
	{sheet:uk, pos:{x:1,y:6}, type:"wnav", nat:"uk", s:2},
	{sheet:uk, pos:{x:2,y:6}, type:"wnav", nat:"uk", s:3},
	{sheet:uk, pos:{x:3,y:6}, type:"wnav", nat:"uk", s:4},
	{sheet:uk, pos:{x:4,y:6}, type:"wnav", nat:"uk", s:5},
	{sheet:uk, pos:{x:5,y:6}, type:"wnav", nat:"uk", s:6},
	{sheet:uk, pos:{x:6,y:6}, type:"wnav", nat:"uk", s:7},
	{sheet:uk, pos:{x:0,y:7}, type:"wnav", nat:"uk", s:8},
	{sheet:uk, pos:{x:1,y:7}, type:"wnav", nat:"uk", s:9},
	{sheet:uk, pos:{x:2,y:7}, type:"wnav", nat:"uk", s:10},
	{sheet:uk, pos:{x:3,y:7}, type:"wnav", nat:"uk", s:20},
	{sheet:uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:uk, pos:{x:8,y:7}, type:"bh", nat:"nu"},
	{sheet:uk, pos:{x:7,y:0}, type:"bmb", nat:"uk", s:1},
	{sheet:uk, pos:{x:8,y:0}, type:"bmb", nat:"uk", s:2},
	{sheet:uk, pos:{x:9,y:0}, type:"bmb", nat:"uk", s:3},
	{sheet:uk, pos:{x:10,y:0}, type:"bmb", nat:"uk", s:4},
	{sheet:uk, pos:{x:11,y:0}, type:"bmb", nat:"uk", s:5},
	{sheet:uk, pos:{x:12,y:0}, type:"bmb", nat:"uk", s:6},
	{sheet:uk, pos:{x:13,y:0}, type:"bmb", nat:"uk", s:7},
	{sheet:uk, pos:{x:7,y:1}, type:"bmb", nat:"uk", s:8},
	{sheet:uk, pos:{x:8,y:1}, type:"bmb", nat:"uk", s:9},
	{sheet:uk, pos:{x:9,y:1}, type:"bmb", nat:"uk", s:10},
	{sheet:uk, pos:{x:10,y:1}, type:"bmb", nat:"uk", s:20},
	{sheet:uk, pos:{x:11,y:1}, type:"nav", nat:"uk", s:8},
	{sheet:uk, pos:{x:11,y:1}, type:"nav", nat:"uk", s:8},
	{sheet:uk, pos:{x:11,y:1}, type:"nav", nat:"uk", s:8},
	{sheet:uk, pos:{x:11,y:1}, type:"nav", nat:"uk", s:8},
	{sheet:uk, pos:{x:7,y:2}, type:"nav", nat:"uk", s:6},
	{sheet:uk, pos:{x:7,y:2}, type:"nav", nat:"uk", s:6},
	{sheet:uk, pos:{x:7,y:2}, type:"nav", nat:"uk", s:6},
	{sheet:uk, pos:{x:10,y:2}, type:"nav", nat:"uk", s:4},
	{sheet:uk, pos:{x:10,y:2}, type:"nav", nat:"uk", s:4},
	{sheet:uk, pos:{x:10,y:2}, type:"nav", nat:"uk", s:4},
	{sheet:uk, pos:{x:7,y:3}, type:"nav", nat:"uk", s:2},
	{sheet:uk, pos:{x:7,y:3}, type:"nav", nat:"uk", s:2},
	{sheet:uk, pos:{x:7,y:3}, type:"nav", nat:"uk", s:2},
	{sheet:uk, pos:{x:10,y:3}, type:"nav", nat:"uk", s:1},
	{sheet:uk, pos:{x:10,y:3}, type:"nav", nat:"uk", s:1},
	{sheet:uk, pos:{x:10,y:3}, type:"nav", nat:"uk", s:1},
	{sheet:uk, pos:{x:10,y:3}, type:"nav", nat:"uk", s:1},
	{sheet:uk, pos:{x:7,y:4}, type:"air", nat:"uk", s:3, m:4},
	{sheet:uk, pos:{x:7,y:4}, type:"air", nat:"uk", s:3, m:4},
	{sheet:uk, pos:{x:7,y:4}, type:"air", nat:"uk", s:3, m:4},
	{sheet:uk, pos:{x:10,y:4}, type:"air", nat:"uk", s:2, m:4},
	{sheet:uk, pos:{x:10,y:4}, type:"air", nat:"uk", s:2, m:4},
	{sheet:uk, pos:{x:10,y:4}, type:"air", nat:"uk", s:2, m:4},
	{sheet:uk, pos:{x:8,y:5}, type:"air", nat:"uk", s:1, m:4},
	{sheet:uk, pos:{x:8,y:5}, type:"air", nat:"uk", s:1, m:4},
	{sheet:uk, pos:{x:8,y:5}, type:"air", nat:"uk", s:1, m:4},
	{sheet:uk, pos:{x:8,y:5}, type:"air", nat:"uk", s:1, m:4},
	{sheet:germany, pos:{x:0,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"1"},
	{sheet:germany, pos:{x:1,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"2"},
	{sheet:germany, pos:{x:2,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"3"},
	{sheet:germany, pos:{x:3,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"4"},
	{sheet:germany, pos:{x:4,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"6"},
	{sheet:germany, pos:{x:5,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"7"},
	{sheet:germany, pos:{x:6,y:0}, type:"inf", nat:"ge", s:3, m:3, lbl:"8"},
	{sheet:germany, pos:{x:0,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"9"},
	{sheet:germany, pos:{x:1,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"10"},
	{sheet:germany, pos:{x:2,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"5 SS"},
	{sheet:germany, pos:{x:3,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"13 SS"},
	{sheet:germany, pos:{x:4,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"15"},
	{sheet:germany, pos:{x:5,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"18"},
	{sheet:germany, pos:{x:6,y:1}, type:"inf", nat:"ge", s:3, m:3, lbl:"20"},
	{sheet:germany, pos:{x:0,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"23"},
	{sheet:germany, pos:{x:1,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"25"},
	{sheet:germany, pos:{x:2,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"27"},
	{sheet:germany, pos:{x:3,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"30"},
	{sheet:germany, pos:{x:4,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"36"},
	{sheet:germany, pos:{x:5,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"39"},
	{sheet:germany, pos:{x:6,y:2}, type:"inf", nat:"ge", s:3, m:3, lbl:"40"},
	{sheet:germany, pos:{x:0,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"44"},
	{sheet:germany, pos:{x:1,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"51"},
	{sheet:germany, pos:{x:2,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"67"},
	{sheet:germany, pos:{x:3,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"74"},
	{sheet:germany, pos:{x:4,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"76"},
	{sheet:germany, pos:{x:5,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"84"},
	{sheet:germany, pos:{x:6,y:3}, type:"inf", nat:"ge", s:3, m:3, lbl:"11"},
	{sheet:germany, pos:{x:0,y:4}, type:"inf", nat:"ge", s:3, m:3, lbl:"17"},
	{sheet:germany, pos:{x:1,y:4}, type:"inf", nat:"ge", s:3, m:3, lbl:"29"},
	{sheet:germany, pos:{x:2,y:4}, type:"inf", nat:"ge", s:3, m:3, lbl:"2 Fsjr"},
	{sheet:germany, pos:{x:3,y:4}, type:"inf", nat:"ge", s:1, m:3, lbl:"49"},
	{sheet:germany, pos:{x:4,y:4}, type:"inf", nat:"ge", s:1, m:3, lbl:"50"},
	{sheet:germany, pos:{x:5,y:4}, type:"inf", nat:"ge", s:1, m:3, lbl:"56"},
	{sheet:germany, pos:{x:6,y:4}, type:"inf", nat:"ge", s:1, m:3, lbl:"66"},
	{sheet:germany, pos:{x:0,y:5}, type:"inf", nat:"ge", s:1, m:3, lbl:"79"},
	{sheet:germany, pos:{x:1,y:5}, type:"inf", nat:"ge", s:1, m:3, lbl:"81"},
	{sheet:germany, pos:{x:2,y:5}, type:"par", nat:"ge", s:3, m:3, lbl:"1 Fsjr"},
	{sheet:germany, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:germany, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:germany, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:germany, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:germany, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:germany, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:germany, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:germany, pos:{x:3,y:5}, type:"res", nat:"ge", s:1},
	{sheet:germany, pos:{x:4,y:6}, type:"pz", nat:"ge", s:5, m:6, lbl:"1 SS"},
	{sheet:germany, pos:{x:5,y:6}, type:"pz", nat:"ge", s:5, m:6, lbl:"GDS"},
	{sheet:germany, pos:{x:6,y:6}, type:"pz", nat:"ge", s:4, m:6, lbl:"57"},
	{sheet:germany, pos:{x:0,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"2 SS"},
	{sheet:germany, pos:{x:1,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"14"},
	{sheet:germany, pos:{x:2,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"19"},
	{sheet:germany, pos:{x:3,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"24"},
	{sheet:germany, pos:{x:4,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"41"},
	{sheet:germany, pos:{x:5,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"46"},
	{sheet:germany, pos:{x:6,y:7}, type:"pz", nat:"ge", s:4, m:6, lbl:"47"},
	{sheet:germany, pos:{x:7,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"48"},
	{sheet:germany, pos:{x:8,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"56"},
	{sheet:germany, pos:{x:9,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"39"},
	{sheet:germany, pos:{x:10,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"DAK"},
	{sheet:germany, pos:{x:11,y:0}, type:"pz", nat:"ge", s:4, m:6, lbl:"9"},
	{sheet:germany, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:germany, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:germany, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:germany, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:germany, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:germany, pos:{x:7,y:1}, type:"air", nat:"ge", s:5, m:4},
	{sheet:germany, pos:{x:10,y:7}, type:"air", nat:"ge", s:1, m:4},
	{sheet:germany, pos:{x:10,y:7}, type:"air", nat:"ge", s:1, m:4},
	{sheet:germany, pos:{x:10,y:7}, type:"air", nat:"ge", s:1, m:4},
	{sheet:germany, pos:{x:10,y:7}, type:"air", nat:"ge", s:1, m:4},
	{sheet:germany, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:germany, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:germany, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:germany, pos:{x:13,y:0}, type:"nav", nat:"ge", s:9},
	{sheet:germany, pos:{x:8,y:6}, type:"nav", nat:"ge", s:8},
	{sheet:germany, pos:{x:8,y:6}, type:"nav", nat:"ge", s:8},
	{sheet:germany, pos:{x:9,y:6}, type:"nav", nat:"ge", s:6},
	{sheet:germany, pos:{x:9,y:6}, type:"nav", nat:"ge", s:6},
	{sheet:germany, pos:{x:11,y:6}, type:"nav", nat:"ge", s:4},
	{sheet:germany, pos:{x:11,y:6}, type:"nav", nat:"ge", s:4},
	{sheet:germany, pos:{x:7,y:7}, type:"nav", nat:"ge", s:2},
	{sheet:germany, pos:{x:7,y:7}, type:"nav", nat:"ge", s:2},
	{sheet:germany, pos:{x:9,y:7}, type:"nav", nat:"ge", s:1},
	{sheet:germany, pos:{x:9,y:7}, type:"nav", nat:"ge", s:1},
	{sheet:germany, pos:{x:7,y:2}, type:"sub", nat:"ge", s:1},
	{sheet:germany, pos:{x:8,y:2}, type:"sub", nat:"ge", s:2},
	{sheet:germany, pos:{x:9,y:2}, type:"sub", nat:"ge", s:3},
	{sheet:germany, pos:{x:10,y:2}, type:"sub", nat:"ge", s:4},
	{sheet:germany, pos:{x:11,y:2}, type:"sub", nat:"ge", s:5},
	{sheet:germany, pos:{x:12,y:2}, type:"sub", nat:"ge", s:6},
	{sheet:germany, pos:{x:13,y:2}, type:"sub", nat:"ge", s:7},
	{sheet:germany, pos:{x:7,y:3}, type:"sub", nat:"ge", s:8},
	{sheet:germany, pos:{x:8,y:3}, type:"sub", nat:"ge", s:9},
	{sheet:germany, pos:{x:9,y:3}, type:"sub", nat:"ge", s:10},
	{sheet:germany, pos:{x:10,y:3}, type:"sub", nat:"ge", s:20},
	{sheet:germany, pos:{x:11,y:3}, type:"int", nat:"ge", s:1},
	{sheet:germany, pos:{x:12,y:3}, type:"int", nat:"ge", s:2},
	{sheet:germany, pos:{x:13,y:3}, type:"int", nat:"ge", s:3},
	{sheet:germany, pos:{x:7,y:4}, type:"int", nat:"ge", s:4},
	{sheet:germany, pos:{x:8,y:4}, type:"int", nat:"ge", s:5},
	{sheet:germany, pos:{x:9,y:4}, type:"int", nat:"ge", s:6},
	{sheet:germany, pos:{x:10,y:4}, type:"int", nat:"ge", s:7},
	{sheet:germany, pos:{x:11,y:4}, type:"int", nat:"ge", s:8},
	{sheet:germany, pos:{x:12,y:4}, type:"int", nat:"ge", s:9},
	{sheet:germany, pos:{x:13,y:4}, type:"int", nat:"ge", s:10},
	{sheet:germany, pos:{x:7,y:5}, type:"int", nat:"ge", s:20},
	{sheet:germany, pos:{x:8,y:5}, type:"ab", nat:"ge"},
	{sheet:germany, pos:{x:8,y:5}, type:"ab", nat:"ge"},
	{sheet:germany, pos:{x:8,y:5}, type:"ab", nat:"ge"},
];

const nat = {
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
	nat[u.nat].push(i);
}

const stage = new Konva.Stage({
		container: 'container',
		width: 3000 * scale,
		height: 3200 * scale,
});

const layer = new Konva.Layer();
stage.add(layer);

var href = new URL(location.href);
var scenario = 0;
let sc = href.searchParams.get("scenario");
if (sc) {
	scenario = Number(sc)
}


// Show counter sheets
if (scenario == 0) {
	const rect1 = new Konva.Rect({
		x: 20,
		y: 1650 * scale,
		width: 2800 * scale,
		height: 1500 * scale,
		fill: 'gray',
	});
	layer.add(rect1);

	var sheets = {variant:variant, uk:uk, italy:italy, fr:fr ,germany:germany, ussr:ussr}
	var u = ussr;
	let sh = href.searchParams.get("sheet");
	if (sh && sheets[sh]) {
		u = sheets[sh]
	}

	layer.add(u.sheet.clone({
		x: 20,
		scale: {
			x: scale,
			y: scale
		},
	}));
	for (let x = 0; x < u.cols; x++) {
		for (let y = 0; y < u.rows; y++) {
			let img = u.image(x, y, `tru${x}-${y}`)
			img.x((x * (side+10) + 100) * scale);
			img.y((y * (side+10) + 1700) * scale);
			layer.add(img);
		}
	}
}

if (scenario == 1) {
	stage.height(7000 * scale)
	document.body.style.background = 'gray'
	let row = 0, col = 0;
	for (let n of Object.values(nat)) {
		for (let i of n) {
			let u = units[i];
			u.img.x((col * (side+10) + 40) * scale);
			u.img.y((row * (side+10) + 40) * scale);
			layer.add(u.img);
			if (++col > 16) { row++; col = 0; }
		}
		col = 0; row++;
	}
}
