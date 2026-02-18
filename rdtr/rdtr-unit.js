// SPDX-License-Identifier: CC0-1.0.
/*
  This is the unit library module for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
 */
import * as map from './rdtr-map.js';
import * as unit from './units.js'

// Enable testing with node.js
var newImage = function() { return new Image() }
if (typeof document == 'undefined') newImage = function() { return {} }


// An array of all units.
// { type:"inf", nat: "fr", m:2, s:3, lbl:"8",
//   stat:"3-3", img:Image, hex:{x:,y:}}  // and more, added later
export const units = [
	{type:"inf", nat: "fr", m:3, s:2, lbl:"Alp"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"Col"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"6"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"7"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"8"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"10"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"11"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"13"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"17"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"16"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"18"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"24"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"25"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"42"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"44"},
	{type:"inf", nat: "fr", m:3, s:2, lbl:"45"},
	{type:"pz",  nat: "fr", m:5, s:3, lbl:"1"},
	{type:"pz",  nat: "fr", m:5, s:3, lbl:"2GCM"},
	{type:"pz",  nat: "fr", m:5, s:3, lbl:"5GCM"},
	{type:"air", nat: "fr", m:4, s:5},
	{type:"air", nat: "fr", m:4, s:5},
	{type:"air", nat: "fr", m:4, s:5},
	{type:"air", nat: "fr", s:3, m:4},
	{type:"air", nat: "fr", s:3, m:4},
	{type:"air", nat: "fr", s:2, m:4},
	{type:"air", nat: "fr", s:1, m:4},
	{type:"air", nat: "fr", s:1, m:4},
	{type:"ab", nat: "fr"},
	{type:"ab", nat: "fr"},
	{type:"ab", nat: "fr"},
	{type:"res", nat: "fr", s:1},
	{type:"res", nat: "fr", s:1},
	{type:"res", nat: "fr", s:1},
	{type:"res", nat: "fr", s:1},
	{type:"nav", nat: "fr", s:9},
	{type:"nav", nat: "fr", s:9},
	{type:"nav", nat: "fr", s:9},
	{type:"nav", nat: "fr", s:8},
	{type:"nav", nat: "fr", s:8},
	{type:"nav", nat: "fr", s:6},
	{type:"nav", nat: "fr", s:6},
	{type:"nav", nat: "fr", s:4},
	{type:"nav", nat: "fr", s:4},
	{type:"nav", nat: "fr", s:2},
	{type:"nav", nat: "fr", s:2},
	{type:"nav", nat: "fr", s:1},
	{type:"nav", nat: "fr", s:1},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"1 Alg"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"2 Alg"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"3 Alg"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"1 Mor"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"2 Mor"},
	{type:"inf", nat:"fr", s:1, m:3, lbl:"1 Tun"},
	{type:"pz", nat:"fr", s:3, m:5, lbl:"1 GCM"},
	{type:"pz", nat:"fr", s:3, m:5, lbl:"3 GCM"},
	{type:"pz", nat:"fr", s:3, m:5, lbl:"4 GCM"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"2"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"3"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"4"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"5"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"6"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"8"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"10"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"12"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"19"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"21"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"22"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"23"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"25b"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"26b"},
	{type:"inf", nat: "us", s:3, m:4, lbl:"27b"},
	{type:"par", nat: "us", s:3, m:3, lbl:"18AB"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"1"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"7"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"13"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"16"},
	{type:"pz", nat: "us", s:5, m:6, lbl:"20"},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"res", nat: "us", s:1},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:5, m:4},
	{type:"air", nat: "us", s:3, m:4},
	{type:"air", nat: "us", s:3, m:4},
	{type:"air", nat: "us", s:2, m:4},
	{type:"air", nat: "us", s:2, m:4},
	{type:"air", nat: "us", s:1, m:4},
	{type:"air", nat: "us", s:1, m:4},
	{type:"air", nat: "us", s:1, m:4},
	{type:"ab", nat: "us"},
	{type:"ab", nat: "us"},
	{type:"ab", nat: "us"},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:9},
	{type:"nav", nat: "us", s:8},
	{type:"nav", nat: "us", s:8},
	{type:"nav", nat: "us", s:6},
	{type:"nav", nat: "us", s:6},
	{type:"nav", nat: "us", s:4},
	{type:"nav", nat: "us", s:4},
	{type:"nav", nat: "us", s:2},
	{type:"nav", nat: "us", s:2},
	{type:"nav", nat: "us", s:1},
	{type:"nav", nat: "us", s:1},
	{type:"inf", nat: "su", s:3, m:3, lbl:"2 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"3 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"5 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"6 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"7 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"8 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"11 Gds"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"1 Shk"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"2 Shk"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"3 Shk"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"5 Shk"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"Nav"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"53"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"57"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"60"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"61"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"62"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"63"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"64"},
	{type:"inf", nat: "su", s:3, m:3, lbl:"70"},
	{type:"par", nat: "su", s:2, m:3, lbl:"1 Pr"},
	{type:"par", nat: "su", s:2, m:3, lbl:"2 Pr"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"3"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"4"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"5"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"6"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"7"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"8"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"9"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"10"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"11"},
	{type:"inf", nat: "su", s:2, m:3, lbl:"12"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"13"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"14"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"16"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"18"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"19"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"20"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"21"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"22"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"23"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"24"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"26"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"27"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"28"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"29"},
	{type:"inf", nat: "su", s:1, m:3, lbl:"30"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"3 Me"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"11 Tk"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"13 Me"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"15 Me"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"19 Me"},
	{type:"pz", nat: "su", s:3, m:5, lbl:"22 Me"},
	{type:"pz", nat: "su", s:4, m:5, lbl:"1 Tk"},
	{type:"pz", nat: "su", s:4, m:5, lbl:"2 Tk"},
	{type:"pz", nat: "su", s:4, m:5, lbl:"3 Tk"},
	{type:"pz", nat: "su", s:4, m:5, lbl:"5 Tk"},
	{type:"air", nat: "su", s:5, m:4},
	{type:"air", nat: "su", s:5, m:4},
	{type:"air", nat: "su", s:5, m:4},
	{type:"air", nat: "su", s:3, m:4},
	{type:"air", nat: "su", s:3, m:4},
	{type:"air", nat: "su", s:2, m:4},
	{type:"air", nat: "su", s:2, m:4},
	{type:"air", nat: "su", s:1, m:4},
	{type:"air", nat: "su", s:1, m:4},
	{type:"ab", nat: "su"},
	{type:"ab", nat: "su"},
	{type:"ab", nat: "su"},
	{type:"nav", nat: "su", s:9},
	{type:"nav", nat: "su", s:9},
	{type:"nav", nat: "su", s:9},
	{type:"nav", nat: "su", s:8},
	{type:"nav", nat: "su", s:8},
	{type:"nav", nat: "su", s:6},
	{type:"nav", nat: "su", s:6},
	{type:"nav", nat: "su", s:4},
	{type:"nav", nat: "su", s:2},
	{type:"nav", nat: "su", s:2},
	{type:"nav", nat: "su", s:1},
	{type:"nav", nat: "su", s:1},
	{type:"mec", nat: "su", s:2, m:5, lbl:"3"},
	{type:"mec", nat: "su", s:2, m:5, lbl:"4"},
	{type:"mec", nat: "su", s:2, m:5, lbl:"5"},
	{type:"mec", nat: "su", s:2, m:5, lbl:"6"},
	{type:"mec", nat: "su", s:2, m:5, lbl:"7"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"13"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"14"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"16"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"18"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"19"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"20"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"21"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"22"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"23"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"24"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"26"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"27"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"28"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"29"},
	{type:"inf", nat: "su", s:2, m:4, lbl:"30"},
	{type:"pz", nat: "su", s:4, m:6, lbl:"1 Tk"},
	{type:"pz", nat: "su", s:4, m:6, lbl:"2 Tk"},
	{type:"pz", nat: "su", s:4, m:6, lbl:"3 Tk"},
	{type:"pz", nat: "su", s:4, m:6, lbl:"5 Tk"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"1"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"2"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"3"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"4"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"5"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"6"},
	{type:"inf", nat:"tu", s:2, m:3, lbl:"7"},	
	{type:"pz", nat:"tu", s:2, m:5, lbl:"1"},
	{type:"pz", nat:"tu", s:2, m:5, lbl:"2"},
	{type:"air", nat:"tu", s:2, m:4, lbl:"Turk"},
	{type:"air", nat:"tu", s:2, m:4, lbl:"Turk"},
	{type:"nav", nat:"tu", s:2},
	{type:"nav", nat:"tu", s:2},
	{type:"nav", nat:"tu", s:2},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Galicia"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Castilla"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Aragon"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Navarr"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Granad"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Cordob"},
	{type:"inf", nat:"sp", s:2, m:3, lbl:"Andalu"},
	{type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{type:"air", nat:"sp", s:2, m:4, lbl:"Sp"},
	{type:"nav", nat:"sp", s:2},
	{type:"nav", nat:"sp", s:2},
	{type:"nav", nat:"sp", s:2},
	{type:"nav", nat:"sp", s:2},
	{type:"pz", nat:"sp", s:2, m:5, lbl:"Madrid"},
	{type:"inf", nat:"nu", s:1, m:3}, // 13 x 1-3
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:1, m:3},
	{type:"inf", nat:"nu", s:2, m:3}, // 14 x 2-3
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"inf", nat:"nu", s:2, m:3},
	{type:"air", nat:"nu", s:1, m:4}, // 7 x 1-4
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"air", nat:"nu", s:1, m:4},
	{type:"nav", nat:"nu", s:2},
	{type:"nav", nat:"nu", s:2},
	{type:"bh", nat:"nu", color:'white', stroke:'black'},
	{type:"bh", nat:"nu", color:'white', stroke:'black'},
	{type:"bh", nat:"nu", color:'white', stroke:'black'},
	{type:"bh", nat:"nu", color:'white', stroke:'black'},
	{type:"bh", nat:"nu", color:'white', stroke:'black'},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"1 Iraq"},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"2 Iraq"},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"3 Iraq"},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"4 Iraq"},
	{type:"inf", nat:"iq", s:1, m:3, lbl:"5 Iraq"},
	{type:"air", nat:"iq", s:2, m:4, lbl:"5 Iraq"},
	{type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{type:"inf", nat:"bu", s:1, m:3, lbl:"Bulg"},
	{type:"air", nat:"bu", s:1, m:4, lbl:"Bulg"},
	{type:"inf", nat:"ru", s:2, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:2, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"inf", nat:"ru", s:1, m:3, lbl:"Rum"},
	{type:"air", nat:"ru", s:1, m:4, lbl:"Rum"},
	{type:"inf", nat:"hu", s:2, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"inf", nat:"hu", s:1, m:3, lbl:"Hun"},
	{type:"air", nat:"hu", s:1, m:4, lbl:"Hun"},
	{type:"air", nat:"fi", s:1, m:4, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"fi", s:2, m:3, lbl:"Finn"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"5"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"8"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"10"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"12"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"11"},
	{type:"inf", nat:"it", s:2, m:3, lbl:"CN"},
	{type:"inf", nat:"it", s:3, m:3, lbl:"Celere"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"Libya"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"14"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"16"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"17"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"20"},
	{type:"inf", nat:"it", s:1, m:3, lbl:"35"},
	{type:"inf", nat:"it", s:3, m:3, lbl:"Alpini"},
	{type:"par", nat:"it", s:2, m:3, lbl:"Fologre"},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"res", nat:"it", s:1},
	{type:"pz", nat:"it", s:2, m:5, lbl:"1"},
	{type:"pz", nat:"it", s:2, m:5, lbl:"2"},
	{type:"pz", nat:"it", s:2, m:5, lbl:"21"},
	{type:"pz", nat:"it", s:2, m:5, lbl:"Celere"},
	{type:"air", nat:"it", s:5, m:4},
	{type:"air", nat:"it", s:5, m:4},
	{type:"air", nat:"it", s:5, m:4},
	{type:"air", nat:"it", s:3, m:4},
	{type:"air", nat:"it", s:3, m:4},
	{type:"air", nat:"it", s:2, m:4},
	{type:"air", nat:"it", s:2, m:4},
	{type:"air", nat:"it", s:1, m:4},
	{type:"ab", nat:"it"},
	{type:"ab", nat:"it"},
	{type:"ab", nat:"it"},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:9},
	{type:"nav", nat:"it", s:8},
	{type:"nav", nat:"it", s:8},
	{type:"nav", nat:"it", s:6},
	{type:"nav", nat:"it", s:6},
	{type:"nav", nat:"it", s:4},
	{type:"nav", nat:"it", s:4},
	{type:"nav", nat:"it", s:2},
	{type:"nav", nat:"it", s:2},
	{type:"nav", nat:"it", s:1},
	{type:"nav", nat:"it", s:1},
	{type:"pz", nat:"it", s:2, m:5, lbl:"Maletti"},
	{type:"inf", nat:"it", s:3, m:3, lbl:"Centauro"},
	{type:"inf", nat:"it", s:3, m:3, lbl:"Freccia"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"1 BEF"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"2 BEF"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"5"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"8"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"9"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"12"},
	{type:"inf", nat:"uk", s:3, m:4, lbl:"2 Can"},
	{type:"inf", nat:"uk", s:1, m:3, lbl:"Egypt"},
	{type:"inf", nat:"uk", s:1, m:3, lbl:"Palest"},
	{type:"inf", nat:"uk", s:1, m:3, lbl:"Malta"},
	{type:"pz", nat:"uk", s:4, m:5, lbl:"13"},
	{type:"pz", nat:"uk", s:4, m:5, lbl:"30"},
	{type:"pz", nat:"uk", s:4, m:5, lbl:"1 Can"},
	{type:"pz", nat:"uk", s:4, m:5, lbl:"Polish"},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"res", nat:"uk", s:1},
	{type:"par", nat:"uk", s:3, m:3, lbl:"1 AB"},
	{type:"pz", nat:"uk", s:2, m:5, lbl:"WDF"},
	{type:"air", nat:"uk", s:5, m:4},
	{type:"air", nat:"uk", s:5, m:4},
	{type:"air", nat:"uk", s:5, m:4},
	{type:"air", nat:"uk", s:5, m:4},
	{type:"air", nat:"uk", s:3, m:4},
	{type:"air", nat:"uk", s:3, m:4},
	{type:"air", nat:"uk", s:3, m:4},
	{type:"air", nat:"uk", s:2, m:4},
	{type:"air", nat:"uk", s:2, m:4},
	{type:"air", nat:"uk", s:2, m:4},
	{type:"air", nat:"uk", s:1, m:4},
	{type:"air", nat:"uk", s:1, m:4},
	{type:"air", nat:"uk", s:1, m:4},
	{type:"air", nat:"uk", s:1, m:4},
	{type:"ab", nat:"uk"},
	{type:"ab", nat:"uk"},
	{type:"ab", nat:"uk"},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:9},
	{type:"nav", nat:"uk", s:8},
	{type:"nav", nat:"uk", s:8},
	{type:"nav", nat:"uk", s:8},
	{type:"nav", nat:"uk", s:8},
	{type:"nav", nat:"uk", s:6},
	{type:"nav", nat:"uk", s:6},
	{type:"nav", nat:"uk", s:6},
	{type:"nav", nat:"uk", s:4},
	{type:"nav", nat:"uk", s:4},
	{type:"nav", nat:"uk", s:4},
	{type:"nav", nat:"uk", s:2},
	{type:"nav", nat:"uk", s:2},
	{type:"nav", nat:"uk", s:2},
	{type:"nav", nat:"uk", s:1},
	{type:"nav", nat:"uk", s:1},
	{type:"nav", nat:"uk", s:1},
	{type:"nav", nat:"uk", s:1},
	{type:"esc", nat:"uk", s:1},
	{type:"esc", nat:"uk", s:2},
	{type:"esc", nat:"uk", s:3},
	{type:"esc", nat:"uk", s:4},
	{type:"esc", nat:"uk", s:5},
	{type:"esc", nat:"uk", s:6},
	{type:"esc", nat:"uk", s:7},
	{type:"esc", nat:"uk", s:8},
	{type:"esc", nat:"uk", s:9},
	{type:"esc", nat:"uk", s:10},
	{type:"esc", nat:"uk", s:20},
	{type:"bmb", nat:"uk", s:1},
	{type:"bmb", nat:"uk", s:2},
	{type:"bmb", nat:"uk", s:3},
	{type:"bmb", nat:"uk", s:4},
	{type:"bmb", nat:"uk", s:5},
	{type:"bmb", nat:"uk", s:6},
	{type:"bmb", nat:"uk", s:7},
	{type:"bmb", nat:"uk", s:8},
	{type:"bmb", nat:"uk", s:9},
	{type:"bmb", nat:"uk", s:10},
	{type:"bmb", nat:"uk", s:20},
	{type:"mec", nat:"uk", s:2, m:5, lbl:"Egypt"},
	{type:"mec", nat:"uk", s:2, m:5, lbl:"Palest"},
	{type:"mec", nat:"uk", s:2, m:5, lbl:"Malta"},
	{type:"inf", nat:"uk", s:2, m:3, lbl:"Egypt"},
	{type:"inf", nat:"uk", s:2, m:3, lbl:"Palest"},
	{type:"inf", nat:"uk", s:2, m:3, lbl:"Malta"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"1"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"2"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"3"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"4"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"6"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"7"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"8"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"9"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"10"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"5 SS"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"13 SS"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"15"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"18"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"20"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"23"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"25"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"27"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"30"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"36"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"39"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"40"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"44"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"51"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"67"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"74"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"76"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"84"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"11"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"17"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"29"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"2 Fsjr"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"49"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"50"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"56"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"66"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"79"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"81"},
	{type:"par", nat:"ge", s:3, m:3, lbl:"1 Fsjr"},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"res", nat:"ge", s:1},
	{type:"pz", nat:"ge", s:5, m:6, lbl:"1 SS"},
	{type:"pz", nat:"ge", s:5, m:6, lbl:"GDS"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"57"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"2 SS"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"14"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"19"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"24"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"41"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"46"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"47"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"48"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"56"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"39"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"DAK"},
	{type:"pz", nat:"ge", s:4, m:6, lbl:"9"},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:5, m:4},
	{type:"air", nat:"ge", s:3, m:4},
	{type:"air", nat:"ge", s:3, m:4},
	{type:"air", nat:"ge", s:3, m:4},
	{type:"air", nat:"ge", s:3, m:4},
	{type:"air", nat:"ge", s:2, m:4},
	{type:"air", nat:"ge", s:2, m:4},
	{type:"air", nat:"ge", s:2, m:4},
	{type:"air", nat:"ge", s:1, m:4},
	{type:"air", nat:"ge", s:1, m:4},
	{type:"air", nat:"ge", s:1, m:4},
	{type:"air", nat:"ge", s:1, m:4},
	{type:"ab", nat:"ge"},
	{type:"ab", nat:"ge"},
	{type:"ab", nat:"ge"},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:9},
	{type:"nav", nat:"ge", s:8},
	{type:"nav", nat:"ge", s:6},
	{type:"nav", nat:"ge", s:6},
	{type:"nav", nat:"ge", s:4},
	{type:"nav", nat:"ge", s:4},
	{type:"nav", nat:"ge", s:2},
	{type:"nav", nat:"ge", s:2},
	{type:"nav", nat:"ge", s:1},
	{type:"nav", nat:"ge", s:1},
	{type:"sub", nat:"ge", s:1},
	{type:"sub", nat:"ge", s:2},
	{type:"sub", nat:"ge", s:3},
	{type:"sub", nat:"ge", s:4},
	{type:"sub", nat:"ge", s:5},
	{type:"sub", nat:"ge", s:6},
	{type:"sub", nat:"ge", s:7},
	{type:"sub", nat:"ge", s:8},
	{type:"sub", nat:"ge", s:9},
	{type:"sub", nat:"ge", s:10},
	{type:"sub", nat:"ge", s:20},
	{type:"int", nat:"ge", s:1},
	{type:"int", nat:"ge", s:2},
	{type:"int", nat:"ge", s:3},
	{type:"int", nat:"ge", s:4},
	{type:"int", nat:"ge", s:5},
	{type:"int", nat:"ge", s:6},
	{type:"int", nat:"ge", s:7},
	{type:"int", nat:"ge", s:8},
	{type:"int", nat:"ge", s:9},
	{type:"int", nat:"ge", s:10},
	{type:"int", nat:"ge", s:20},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"49"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"50"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"56"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"66"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"79"},
	{type:"mec", nat:"ge", s:2, m:6, lbl:"81"},
	{type:"par", nat:"ge", s:3, m:3, lbl:"2 Fsjr"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"Sp SS"},
	{type:"inf", nat:"ge", s:3, m:3, lbl:"Tu SS"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"1 Fr SS"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"2 Fr SS"},
	{type:"inf", nat:"ge", s:1, m:3, lbl:"Croat SS"},
	{type:"bh", nat:"ge"},
	{type:"bh", nat:"ge"},
	{type:"bh", nat:"ge"},
]
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

export async function init(_layer) {
	layer = _layer
	// Define .stat from .s and .m
	for (const u of units) {
		if ('s' in u) {
			if (u.m)
				u.stat = `${u.s}-${u.m}`
			else
				u.stat = `${u.s}`
		}
	}
	unit.addUnitGenerator('nav', unit.ugenNav)
    unit.addUnitGenerator('ab', unit.ugenAb)
	unit.addUnitGenerator('bh', ugenBh)
	await unit.init(units, nations, 0.88, false)
	for (const u of units) {
		u.img.draggable(true)
		u.img.on('dragstart', function(e) {
			e.target.moveToTop()
		})
		u.img.on('dragend', snapToHex)
	}
}
function ugenBh(conf, u, side) {
	u.add(new Konva.Circle({
		stroke: conf.stroke,
		radius: side*0.33,
		strokeWidth: 3,
		x: side/2,
		y: side/2,
	}))
	u.add(new Konva.Text({
		fill: conf.stroke,
		text: "BH",
		fontStyle: 'bold',
		fontFamily: 'sans-serif',
		fontSize: side/3,
		x: side*0.26,
		y: side*0.32,
	}))
	return true
}

// ----------------------------------------------------------------------
// Unit find and user-friendly representation

// For "generic" units, like "ge,air,5-4" where we want *any*
// unit that match, but NOT the same unit, do:
//   unselectAll()
//   u = fromStr("ge,air,5-4", (u)=>u.selected)
export function unselectAll() {
	for (const u of units) {
		delete u.selected
	}
}
export function fromStr(str, filterOut) {
	// By default no units are filtered. Useful filters may be:
	//   (u)=>u.selected   - exclude already selected
	//   (u)=>u.allowable  - exclude allowable's
	//   (u)=>!u.allowable - include allowable's
	//   (u)=>u.hex        - exclude placed units
	if (!filterOut) filterOut=((u) => false)
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
		if (filterOut(u)) continue
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
	// in the "units" array Since u.img is a Konva.Group, the clicked
	// item may be anything in it
	let g = img.findAncestor('Group', true)
	i = Number(g.id().substring(5))
    return units[i]
}

// ----------------------------------------------------------------------
// Unit placement functions:

let layer						  // The layer where units are placed

export function removeFromMap(u) {
	if (!u.hex) return
	map.unitRemove(u)
	u.img.remove()
	delete u.hex
}

function pixelPos(hex) {
	let h = map.hexToPixel(hex)
	return {x: h.x, y: h.y}
}
function place(u, hex) {
	u.hex = hex
	map.unitAdd(u)
	px = pixelPos(hex)
	if (isStack(hex)) px = stackAdjust(px)
	u.img.position(px)
	u.img.on('dragend', snapToHex)
	layer.add(u.img)
}
export function placeRdtr(u, rc) {
	place(u, map.rdtrToHex(rc))
}
// This function should be called after the user has placed a unit,
// for instance from 'dragend'.
export function snapToHex(e) {
	let img = e.target
	// Get the unit object from the image
	let u = fromImage(img)
	// The unit img coordinate is top-left, adjust to center
	let pos = {x:img.x(), y:img.y()}
	// Get the hex, and update the unit object
	map.unitRemove(u)
	let hex = map.pixelToHex(pos)
	u.hex = hex
	map.unitAdd(u)
	// Snap!
	pos = pixelPos(hex)		// adjusted pos
	if (isStack(hex)) pos = stackAdjust(pos)
	img.position(pos)
	//console.log(`map: ${map.unitsTotal()}, placed: ${placedUnits()}`)
}
function isStack(hex) {
	const s = map.unitsGet(hex)
	if (!s) return false
	return s.size > 1
}
function stackAdjust(pos) {
	let offset = 4
	return {x:pos.x - offset, y:pos.y - offset}
}

// for debugging
function placedUnits() {
	let t = 0
	for (const u of units) {
		if (u.hex) t++
	}
	return t
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
	box
	#sizeC = 60
	#sizeR = 70
	#offsetX = 50
	#offsetY = 80
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
		let pos = layer.position()
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
		layer.add(this.box)
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
		e.target.moveTo(layer)
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
	constructor() {
		super({
			// nu+iq+bh, sp+tu, fin+bulg, rum+hun
			rows: 4,
			// sp+tu: inf,pz,air,nav,(blank),inf,pz,air,nav
			cols: 9,
			text: "Neutrals and Minor Allies"
		})

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
	constructor() {
		super({
			// ge,it,uk,su,fr,us,nu*
			rows: 6,
			// 5-4, 3-4, 2-4, 1-4, ab
			cols: 5,
			text: "Air Exchange",
		})

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
		super({
			// ge,it,uk,su,fr,us
			rows: 6,
			// 9,8,6,4,2,1
			cols: 6,
			text: "Fleet Exchange"
		})

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
