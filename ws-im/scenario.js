// SPDX-License-Identifier: CC-BY-4.0.

import scTrafalgar2 from './sc-trafalgar2.json'
import scTrafalgar from './sc-trafalgar.json'
import scNymCle from './sc-nym-cle.json'
import scMarHer from './sc-mar-her.json'
import scNordic from './sc-nordic.json'

const scenario = new Map()

export function get(id) {
	return scenario.get(id)
}

export function init() {
	if (typeof scUser !== 'undefined') scenario.set("user", JSON.parse(scUser))
	scenario.set(scTrafalgar.id, scTrafalgar)
	scenario.set(scTrafalgar2.id, scTrafalgar2)
	scenario.set(scNymCle.id, scNymCle)
	scenario.set(scMarHer.id, scMarHer)
	scenario.set(scNordic.id, scNordic)
}

