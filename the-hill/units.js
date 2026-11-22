// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the units module for:
  https://github.com/uablrek/hex-games/tree/main/the-hill
*/

import Konva from 'konva'
import {ui, unit, map} from '@uablrek/hex-games'
import {g} from './game.js'

export async function init() {
	// Units
	for (const u of units) {
		const s = u.stat.split('-')
		u.s = Number(s[0])
		u.m = Number(s[1])
	}	
	await unit.init(units, nations, 0.75)
	g.units = units
}

export function deployEnglish() {
	g.unitBox = new unit.UnitBox({
		text: "Eng",
		cols: 2,
		//mustBeEmpty: true,
		unitTypes: [
			{type:'inf', stat: "3-4"},
			{type:'cav', stat: "3-6"},
		],
		destroyCallback: (ub) => g.unitBox = null,
		destroyable: false,
	})
	for (const u of units) {
		if (u.nat != 'en') continue
		if (u.hex) continue
		g.unitBox.addUnit(u)
	}
	g.unitBox.box.position({x:400,y:200})
	ui.board.add(g.unitBox.box)
}
export function deployFrench() {
	g.unitBox = new unit.UnitBox({
		text: "Fr",
		cols: 3,
		//mustBeEmpty: true,
		unitTypes: [
			{type:'inf', stat: "4-4"},
			{type:'cav', stat: "3-6"},
			{type:'art', stat: "6-2"},
		],
		destroyCallback: (ub) => g.unitBox = null,
		destroyable: false,
	})
	for (const u of units) {
		if (u.nat != 'fr') continue
		if (u.hex) continue
		g.unitBox.addUnit(u)
	}
	g.unitBox.box.position({x:800,y:400})
	ui.board.add(g.unitBox.box)
}
// Side-effect: if the deployment is valid all deployed units will
// become "un-draggable"
export function validDeployment() {
	let nat, prop, ret=true
	if (g.player == "English") {
		nat = 'en'
		prop = 'b'
	} else {
		nat = 'fr'
		prop = 'a'
	}
	for (const u of units) {
		if (u.nat != nat) continue
		if (!u.hex) continue
		let h = map.getHex(u.hex)
		if (!h || !h.prop || !h.prop.includes(prop) || h.units.size > 2) {
			map.removeUnit(u)
			u.img.remove()
			ret=false
		}
	}
	// If valid, make "un-draggable"
	if (ret) {
		for (const u of units) {
			if (u.nat != nat) continue
			u.img.off('dragstart')
			u.img.off('dragend')
			u.img.draggable(false)
		}
	}
	return ret
}

// ----------------------------------------------------------------------
// Units

const nations = {
	fr: {color: 'lightblue'},
	en: {color: '#cc4444'},
}

const units = [
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'1'},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'2'},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'3'},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'4'},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'5'},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'6'},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'7'},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'8'},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'9'},
	{nat:'fr', type:'inf', stat: "4-4", sz:'II', lbl:'10'},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'1'},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'2'},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'3'},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'4'},
	{nat:'fr', type:'cav', stat: "3-6", sz:'II', lbl:'5'},
	{nat:'fr', type:'art', stat: "6-2", sz:'II', lbl:'1'},
	{nat:'fr', type:'art', stat: "6-2", sz:'II', lbl:'2'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'1'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'2'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'3'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'4'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'5'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'6'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'7'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'8'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'9'},
	{nat:'en', type:'inf', stat: "3-4", sz:'II', lbl:'10'},
	{nat:'en', type:'cav', stat: "3-6", sz:'II', lbl:'1'},
	{nat:'en', type:'cav', stat: "3-6", sz:'II', lbl:'2'},
]
