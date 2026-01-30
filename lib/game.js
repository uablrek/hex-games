// SPDX-License-Identifier: CC0-1.0.
/*
  This is the Game Control module for:
  https://github.com/uablrek/hex-games/

  The central concept here is "Sequence". For example a player turn can be:
  1. Movement
  2. Combat assignment
  3. Combat resolution
  4. Post-combat advancement
*/

import * as box from './textbox.js'

let traceBox
export function traceOn(box, seq=null) {
	traceBox = box
	if (seq) trace(seq)
}
export function traceOff(box) {
	traceBox = null
}
function trace(seq) {
	if (!traceBox) return
	if (!seq.currentStep) {
		box.update(traceBox, `Seq ${seq.name}: End Reached`)
		return
	}
	let s = seq.currentStep
	let i = seq.index
	if (s.name) {
		box.update(traceBox, `Seq ${seq.name}: step ${i}, ${s.name}`)
		return
	}
	box.update(traceBox, `Seq ${seq.name}: step ${i}`)
}

export class Sequence {
	name = "aseq"
	// step: { start:fn(), end:fn(), whatever...}
	steps						// an array of steps
	currentStep
	index = 0
	userRef
	constructor(obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				this[prop] = obj[prop];
			}
		}
	}
	reset() {
		this.currentStep = null
		this.index = 0
	}
	nextStep() {
		if (!this.currentStep) {
			// first step, or beyond last step
			if (!this.steps) return // (better safe than sorry)
			if (this.index < this.steps.length) {
				this.currentStep = this.steps[0]
				trace(this)			// before start since it can step
				if (this.currentStep.start) this.currentStep.start(this)
				return
			}
		}
		this.index++
		if (this.index >= this.steps.length) {
			// end of the line
			let step = this.currentStep
			this.currentStep = null
			// Trace after this.currentStep=null, but before end()
			trace(this)
			if (step && step.end) step.end(this)
			return
		}
		if (this.currentStep.end) this.currentStep.end(this)
		this.currentStep = this.steps[this.index]
		trace(this)
		if (this.currentStep.start) this.currentStep.start(this)
	}
	repeatStep() {
		if (!this.currentStep) return
		// (don't allow end() here)
		trace(this)
		if (this.currentStep.start) this.currentStep.start(this)		
	}
}
