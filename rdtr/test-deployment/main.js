// SPDX-License-Identifier: CC-BY-4.0.
/*
  Deployment test for:
  https://github.com/uablrek/hex-games/tree/main/rdtr

  The board scroll and unit-boxes are tested. Also used for saving
  default deployments.
*/

import {ui, sequence, lsave, unit} from '@uablrek/hex-games'
import {deploy, units} from './units.js'
import deployment from './rdtr.json'
import sc1939 from './scenario-1939.json'
export let sc
const log = console.log

ui.setKeys([
	{key: 'Enter', fn:sequence.nextStep},
	{key: 's', fn:save},
])

function save() {
	const a = []
	for (const u of units) {
		if (!u.hex) continue
		a.push({u: unit.toStr(u), hex: u.hex})
	}
	lsave.saveJSON(a, "rdtr.json")
}

sequence.add(new sequence.Sequence({
	name: "deployment",
	nat: ['nu','ge','it','uk','su','fr','sp','tu','fi','ru','hu','bu'],
	ni: 0,
	steps: [
		{
			start: function(seq) {
				for (const uh of deployment)
					unit.place(uh, ui.board, true)
				seq.nextStep()
			}
		},
		{
			name: "Deploy",
			start: function(seq) {
				const nat = seq.nat[seq.ni]
				if (['ge','it','uk','su','fr'].includes(nat))
					seq.unitbox = deploy(nat, (u)=>!u.initial)
				else
					seq.unitbox = deploy(nat, (u)=>u.selected)
			},
			end: function(seq) {
				seq.unitbox.destroy()
			}
		},
		{
			start: function(seq) {
				seq.ni++
				if (seq.ni < seq.nat.length)
					seq.gotoStep("Deploy")
			}
		},
	],
}), true)

// ----------------------------------------------------------------------
// Main
import {init as initUnits} from './units.js'
import {init as initMap} from './map.js'
export const selected = {}
;(async () => {
	sc = sc1939
	ui.init()
	await initMap()
	initUnits()
	await unit.toImages()		// convert before any unists are displayed
	sequence.nextStep()
})()
