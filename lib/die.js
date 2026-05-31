// SPDX-License-Identifier: CC0-1.0.
// A simple die-roll function

export function roll(d = "1d6") {
	const da = d.split('d')
	let s = 0
	for (let i = 0; i < da[0]; i++)
		s += (Math.floor(Math.random() * da[1]) + 1)
	return s
}
