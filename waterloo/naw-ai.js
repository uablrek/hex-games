// SPDX-License-Identifier: CC-BY-4.0.
/*
  This is the main AI module for:
  https://github.com/uablrek/hex-games/tree/main/waterloo
*/

import {sequence} from '@uablrek/hex-games'
import * as basic from './naw-ai-basic.js'
import {g, undeployed, updatePhase} from './main.js'

export function init(name = "basic") {
	if (name in ais) {
		ai = ais[name]
	} else {
		alert(`AI "${name}" doesn't exist. Resorting to basic`)
		ai = ais["basic"]
	}
	ai.init()
}
export const ais = {
	basic: basic.ai,
}
let ai

/*
  This sequence replaces the "player" sequence in AI-mode.
  The human user will be in play on a DR result
 */
sequence.add(new sequence.Sequence({
	name: "ai-player",
	steps: [
		{
			name: "Reinforcements",
			start: function(seq) {
				if (g.turn < 3 || g.nat != "al" || undeployed.size == 0) {
					seq.nextStep()
					return
				}
				updatePhase(seq)
				ai.reinforcements(seq)
			}
		},
		{
			name: "Movement",
			start: function(seq) {
				updatePhase(seq)
				ai.movement(seq)
			}
		},
		{
			name: "Combat Assignment",
			start: function(seq) {
				updatePhase(seq)
				ai.combatAssignment(seq)
			}
		},
		{
			name: "Combat Resolution",
			start: function(seq) {
				updatePhase(seq)
				ai.combatResolution(seq)
			}
		},
		{
			start: sequence.back
		},
	],
}))

