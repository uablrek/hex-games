// SPDX-License-Identifier: CC0-1.0.

import scTest1 from './sc-test1.json'
import scTrafalgar from './sc-trafalgar.json'

const scenario = new Map()

export function get(id) {
	return scenario.get(id)
}

export function init() {
	scenario.set(scTest1.id, scTest1)
	scenario.set(scTrafalgar.id, scTrafalgar)
}
