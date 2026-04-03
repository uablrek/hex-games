// SPDX-License-Identifier: CC0-1.0.
/*
  Unit module for for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import {unit} from '@uablrek/hex-games'

export const nations = {
	al: {color: '#CC0000', stroke:'white'},
	pu: {color: '#ECECEC'},
	fr: {color: '#002654', stroke:'white'},
}

export const units = [
	// 'ih' is initial hex, t:arrival turn, p:probability of 1d6
	{nat:"al", type:"inf", sz:"xx", ll:"1", lbl:"1", stat:"7-4", ih:"1010"},
	{nat:"al", type:"inf", sz:"xx", ll:"3", lbl:"1", stat:"6-4", ih:"1209"},
	{nat:"al", type:"inf-du", sz:"xx", ll:"2", lbl:"1", stat:"5-4", ih:"1608"},
	{nat:"al", type:"inf-du", sz:"xx", ll:"3", lbl:"1", stat:"4-4", ih:"0310"},
	{nat:"al", type:"art", sz:"x", lbl:"1", stat:"3-3", ih:"1409"},
	{nat:"al", type:"inf", sz:"xx", ll:"2", lbl:"11", stat:"6-4", ih:"0810"},
	{nat:"al", type:"inf", sz:"xx", ll:"4", lbl:"11", stat:"6-4", ih:"0509"},
	{nat:"al", type:"art", sz:"x", lbl:"11", stat:"2-3", ih:"1110"},
	{nat:"al", type:"inf", sz:"xx", ll:"5", lbl:"Res", stat:"7-4", ih:"1708"},
	{nat:"al", type:"inf", sz:"xx", ll:"6", lbl:"Res", stat:"6-4", ih:"1509"},
	{nat:"al", type:"inf-bw", sz:"xx", ll:"Brw", lbl:"Res", stat:"2-4", ih:"0807"},
	{nat:"al", type:"inf-ha", sz:"x", ll:"Det", lbl:"Res", stat:"1-4", ih:"0914"},
	{nat:"al", type:"art", sz:"x", lbl:"Res", stat:"3-3", ih:"1310"},
	{nat:"al", type:"cav", sz:"xx", ll:"Hvy", lbl:"C", stat:"4-5", ih:"1109"},
	{nat:"al", type:"cav", sz:"xx", ll:"Gen", lbl:"C", stat:"4-5", ih:"1407"},
	{nat:"al", type:"cav", sz:"xx", ll:"RF", lbl:"C", stat:"3-5", ih:"0711"},
	{nat:"al", type:"cav", sz:"xx", ll:"LF", lbl:"C", stat:"3-5", ih:"1707"},
	{nat:"al", type:"cav-du", sz:"xx", ll:"1", lbl:"1", stat:"1-5", ih:"1207"},
	{nat:"pu", type:"inf", sz:"x", ll:"5", lbl:"11", stat:"5-4", t:3, p:5},
	{nat:"pu", type:"inf", sz:"x", ll:"13", lbl:"IV", stat:"4-4", t:3, p:5},
	{nat:"pu", type:"cav", sz:"xx", ll:"C", lbl:"11", stat:"3-5", t:3, p:5},
	{nat:"pu", type:"art", sz:"x", lbl:"IV", stat:"3-3", t:3, p:5},
	{nat:"pu", type:"inf", sz:"x", ll:"14", lbl:"IV", stat:"4-4", t:3, p:4},
	{nat:"pu", type:"inf", sz:"x", ll:"15", lbl:"IV", stat:"4-4", t:3, p:4},
	{nat:"pu", type:"inf", sz:"x", ll:"16", lbl:"IV", stat:"4-4", t:3, p:4},
	{nat:"pu", type:"cav", sz:"xx", ll:"C", lbl:"IV", stat:"3-5", t:3, p:4},
	{nat:"pu", type:"art", sz:"x", lbl:"II", stat:"4-3", t:3, p:4},
	{nat:"pu", type:"inf", sz:"x", ll:"6", lbl:"II", stat:"5-4", t:5, p:2},
	{nat:"pu", type:"inf", sz:"x", ll:"7", lbl:"II", stat:"4-4", t:5, p:2},
	{nat:"pu", type:"cav", sz:"xx", ll:"C", lbl:"III", stat:"3-5", t:5, p:2},
	{nat:"pu", type:"art", sz:"x", lbl:"I", stat:"3-3", t:5, p:2},
	{nat:"pu", type:"inf", sz:"x", ll:"1", lbl:"I", stat:"5-4", t:5, p:1},
	{nat:"pu", type:"inf", sz:"x", ll:"3", lbl:"I", stat:"4-4", t:5, p:1},
	{nat:"pu", type:"cav", sz:"xx", ll:"C", lbl:"I", stat:"3-5", t:5, p:1},

	{nat:"fr", type:"inf", sz:"xx", ll:"Gren", lbl:"Gd", stat:"7-4", ih:"1517"},
	{nat:"fr", type:"inf", sz:"xx", ll:"Chas", lbl:"Gd", stat:"6-4", ih:"1317"},
	{nat:"fr", type:"inf", sz:"xx", ll:"Yng", lbl:"Gd", stat:"5-4", ih:"1416"},
	{nat:"fr", type:"cav", sz:"xx", ll:"Hvy", lbl:"Gd", stat:"4-5", ih:"1016"},
	{nat:"fr", type:"cav", sz:"xx", ll:"Lt", lbl:"Gd", stat:"3-6", ih:"1814"},
	{nat:"fr", type:"art", sz:"xx", lbl:"Gd", stat:"5-3", ih:"1411"},
	{nat:"fr", type:"inf", sz:"xx", ll:"2", lbl:"I", stat:"5-4", ih:"1612"},
	{nat:"fr", type:"inf", sz:"xx", ll:"1", lbl:"I", stat:"4-4", ih:"1513"},
	{nat:"fr", type:"inf", sz:"xx", ll:"3", lbl:"I", stat:"4-4", ih:"1712"},
	{nat:"fr", type:"inf", sz:"xx", ll:"4", lbl:"I", stat:"4-4", ih:"1812"},
	{nat:"fr", type:"cav", sz:"xx", ll:"1", lbl:"I", stat:"2-5", ih:"2011"},
	{nat:"fr", type:"art", sz:"xx", lbl:"I", stat:"3-3", ih:"0915"},
	{nat:"fr", type:"inf", sz:"xx", ll:"6", lbl:"II", stat:"7-4", ih:"0814"},
	{nat:"fr", type:"inf", sz:"xx", ll:"9", lbl:"II", stat:"5-4", ih:"1014"},
	{nat:"fr", type:"inf", sz:"xx", ll:"5", lbl:"II", stat:"4-4", ih:"1314"},
	{nat:"fr", type:"cav", sz:"xx", ll:"2", lbl:"II", stat:"2-5", ih:"0514"},
	{nat:"fr", type:"art", sz:"xx", lbl:"II", stat:"3-3", ih:"1511"},
	{nat:"fr", type:"cav", sz:"xx", ll:"3", lbl:"III", stat:"1-5", ih:"1414"},
	{nat:"fr", type:"inf", sz:"xx", ll:"19", lbl:"IV", stat:"4-4", ih:"1315"},
	{nat:"fr", type:"inf", sz:"xx", ll:"20", lbl:"IV", stat:"4-4", ih:"1316"},
	{nat:"fr", type:"art", sz:"xx", lbl:"VI", stat:"2-3", ih:"1415"},
	{nat:"fr", type:"cav", sz:"xx", ll:"5", lbl:"IC", stat:"1-5", ih:"1515"},
	{nat:"fr", type:"cav", sz:"xx", ll:"11", lbl:"IIIC", stat:"2-5", ih:"1015"},
	{nat:"fr", type:"cav", sz:"xx", ll:"12", lbl:"IIIC", stat:"2-5", ih:"0916"},
	{nat:"fr", type:"cav", sz:"xx", ll:"13", lbl:"IVC", stat:"1-5", ih:"1714"},
	{nat:"fr", type:"cav", sz:"xx", ll:"14", lbl:"IVC", stat:"1-5", ih:"1813"},
	{nat:"fr", type:"inf", sz:"xx", ll:"12", lbl:"IV", stat:"5-4", t:3, p:3},
	{nat:"fr", type:"inf", sz:"xx", ll:"13", lbl:"IV", stat:"4-4", t:3, p:3},
	{nat:"fr", type:"inf", sz:"xx", ll:"14", lbl:"IV", stat:"4-4", t:3, p:3},
	{nat:"fr", type:"art", sz:"xx", lbl:"IV", stat:"3-3", t:3, p:3},
	{nat:"fr", type:"cav", sz:"xx", ll:"9", lbl:"IIC", stat:"2-5", t:3, p:3},
	{nat:"fr", type:"inf", sz:"xx", ll:"8", lbl:"III", stat:"5-4", t:3, p:1},
	{nat:"fr", type:"inf", sz:"xx", ll:"10", lbl:"III", stat:"6-4", t:3, p:1},
	{nat:"fr", type:"inf", sz:"xx", ll:"11", lbl:"III", stat:"5-4", t:3, p:1},
	{nat:"fr", type:"art", sz:"xx", lbl:"III", stat:"3-3", t:3, p:1},
	{nat:"fr", type:"inf", sz:"xx", ll:"21", lbl:"VI", stat:"2-4", t:3, p:1},
	{nat:"fr", type:"cav", sz:"xx", ll:"6", lbl:"IV", stat:"1-5", t:3, p:1},
	{nat:"fr", type:"cav", sz:"xx", ll:"10", lbl:"IIC", stat:"2-5", t:3, p:1},
	{nat:"fr", type:"cav", sz:"xx", ll:"4", lbl:"IC", stat:"1-5", t:3, p:1},
]

function ugenCol(u, img, side, fill) {
	// The type is like "inf-du"
	let stype = u.type.split('-')
	const col = {
		du: '#F09000',
		ha: '#FFCE08',
		bw: 'black',
	}
	img.add(new Konva.Rect({
		fill: col[stype[1]],
		width: unit.c.rw,
		height: unit.c.rh,
		x: unit.c.rx,
		y: unit.c.ry,
	}))
	u.type = stype[0]
	return false
}
unit.addUnitGenerator("inf-du", ugenCol)
unit.addUnitGenerator("cav-du", ugenCol)
unit.addUnitGenerator("inf-ha", ugenCol)
unit.addUnitGenerator("inf-bw", ugenCol)

// Add fields m-movement,s-strength
export async function unitInit() {
	for (const u of units) {
		const s = u.stat.split('-')
		u.s = Number(s[0])
		u.m = Number(s[1])
	}
	return unit.init(units, nations, 1.0)
}

