// SPDX-License-Identifier: CC-BY-4.0.

import scTrafalgar from './sc-trafalgar.json'
import scNymCle from './sc-nym-cle.json'

const scenario = new Map()

export function get(id) {
	return scenario.get(id)
}

export function init() {
	if (typeof scUser !== 'undefined') scenario.set("user", JSON.parse(scUser))
	scenario.set(scTrafalgar.id, scTrafalgar)
	scenario.set(scNymCle.id, scNymCle)
}

