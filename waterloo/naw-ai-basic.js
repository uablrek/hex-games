// SPDX-License-Identifier: CC0-1.0.
/*
  This is the Basic AI module for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import {sequence} from '@uablrek/hex-games'
import {ais} from './naw-ai.js'
import {units} from './naw-units.js'
import {
	g, prepareCombatAssignment, computeZOC, nat, removeTargetMarkers,
	setTargetMarker
} from './main.js'

export const ai = {
	init: function(){},
	reinforcements: reinforcements,
	movement: movement,
	combatAssignment: combatAssignment,
	combatResolution: combatResolution,
}
function reinforcements(seq) {
	setTimeout(sequence.nextStep, 2000)
}
function movement(seq) {
	setTimeout(sequence.nextStep, 2000)
}
function combatAssignment(seq) {
	sequence.jump(seq, "ai-basic-combatAssignment")
}
function combatResolution(seq) {
	setTimeout(sequence.nextStep, 2000)
}

// ----------------------------------------------------------------------
// Combat Assignment

sequence.add(new sequence.Sequence({
	name: "ai-basic-combatAssignment",
	steps: [
		{
			start: function(seq) {
				computeZOC()
				// prepareCombatAssignment set .engaged=true for *all*
				// engaged units, friend or foe
				prepareCombatAssignment()
				for (const u of units) u.assigned = false
				setTimeout(sequence.nextStep, 2000)
			},
		},
		{
			// We want to assign defenders one-by-one, with a delay in
			// between.
			// TODO: multiple defenders face *one* attacker
			name: "Next defender",
			start: function(seq) {
				removeTargetMarkers()
				for (const u of units) {
					if (!u.hex) continue
					if (nat(u.nat) == g.nat || !u.engaged) continue
					if (!u.engaged) continue
					if (!u.assigned) {
						u.assigned = true
						setTargetMarker(u)
						setTimeout(sequence.nextStep, 2000)
						return
					}
				}
				// If we get here, there are no more defenders
				setTimeout(sequence.back, 1000, seq)
			}
		},
		{
			start: function(seq) {
				seq.gotoStep("Next defender")
			},
		},
	],
}))

