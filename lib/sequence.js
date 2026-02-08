// SPDX-License-Identifier: CC0-1.0.
/*
  This is the Game Control module for:
  https://github.com/uablrek/hex-games/

  The central concept here is "Sequence". For example a player turn can be:
  1. Movement
  2. Combat assignment
  3. Combat resolution
  4. Post-combat advancement

  Sequences are chained. They have a "prev" and a "next" sequence
  (mportent on save). The top-sequence probably is something simple,
  like:
  1. New or Restore? (execute a sub-sequence)
  2. Game turn (will be repeated)
  3. Check victory conditions

  If "jump()" is used to proceed to a sub-sequence (which it should),
  then "back()" *must* be used to return to the previous sequence (a
  jump upwards can cause indefinite loops).

  To jump/back to another sequence is *forbidden* in "end()". Add a
  new step instead and do it in "start()".
  
  Save/Restore:
  
  The sequence objects are not saved. The save follow the chain and
  save the sequence name and index for each sequence. On restore the
  chain is restored and "nextStep()" on the lowest sequence in the
  chain is executed. This implies that it is only possible to save a
  certain points. An idea is to save a "snapshot" internally when a
  save is possible, and inform the user.
*/

import * as box from './textbox.js'

let traceBox
export function traceOn(box) {
	traceBox = box
	let seq = top
	while (seq.next) seq = sequences.get(seq.next)
	trace(seq)
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
	let str = `Seq ${seq.name}: step ${i}`
	if (s.name) str += `, ${s.name}`
	if (typeof seq.userRef == 'string') str += `, ${seq.userRef}`
	box.update(traceBox, str)
}

let sequences = new Map()
let top
export function add(seq, _top=false) {
	sequences.set(seq.name, seq)
	if (_top) top = seq
}
export function snapshot() {
	if (!top) return []
	let s = []
	let seq = top
	while (seq) {
		s.push(seq.name, {index: seq.index, next: seq.next})
		seq = sequences.get(seq.next)
	}
	return s
}
export function restore(s) {
	if (!s) return
	let prev, seq
	for (const si of s) {
		seq = sequences.get(si.name)
		seq.index = si.index
		seq.currentStep = seq.steps[seq.index]
		if (prev) seq.prev = prev
		prev = seq.name
	}
	return seq
}
export function nextStep() {
	if (!top) alert("No top sequence")
	let seq = top
	while (seq.next) seq = sequences.get(seq.next)
	seq.nextStep()
}
// from is a sequence, but "to" is a sequence-name
export function jump(from, _to, reset=true) {
	let to = sequences.get(_to)
	from.next = to.name
	to.prev = from.name
	if (reset) to.reset()
	to.nextStep()
}
export function back(seq) {
	let prev = sequences.get(seq.prev)
	delete seq.prev
	delete prev.next
	prev.nextStep()
}
export function proceed(seq) {
	seq.nextStep()
}

export class Sequence {
	name = "seq"
	prev
	next
	// step: { start:fn(), end:fn(), whatever...}
	steps = []					// an array of steps
	currentStep
	index = 0
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
			// beyond last step?
			if (!this.steps || this.index >= this.steps.length) return
			// first step
			this.currentStep = this.steps[0]
			trace(this)			// before start since it can step
			if (this.currentStep.start) this.currentStep.start(this)
			return
		}
		if (this.currentStep.end) this.currentStep.end(this)

		this.index++
		if (this.index >= this.steps.length) {
			// end of the line
			this.currentStep = null
			trace(this)
			return
		}
		this.currentStep = this.steps[this.index]
		trace(this)
		if (this.currentStep.start) this.currentStep.start(this)
	}
	repeatStep() {
		if (!this.currentStep) return
		// (don't call end() here. It's not the end-of-step)
		trace(this)
		if (this.currentStep.start) this.currentStep.start(this)		
	}
	gotoStep(name) {
		for (const [i, s] of this.steps.entries()) {
			//console.log(`${this.name}: ${i}, ${s.name}`)
			if (s.name == name) {
				this.index = i
				this.currentStep = s
				trace(this)
				if (s.start) s.start(this)
				return
			}
		}
		alert(`FAIL: goto ${name} in ${this.name}`)
	}
}
