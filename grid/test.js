/*
  Invoke with: node test.js
*/

import assert from 'node:assert/strict'
import * as hex from './hex-grid.js';

function testPixelHex(tc) {
	hex.configure(58.7, 0.988, {x:57, y:23})	// (rdtr values)
	let pixel = {x:2563, y:1434}
	let h = hex.pixelToHex(pixel)
	assert.deepStrictEqual(h, {x:44, y:29})
	// When converted back the "near hex" pixel should be converted to
	// the hex center. The correct pos is {x:2555, y:1450}, however
	// The "pattern image problem" hit us here!
	pixel = hex.hexToPixel(h)
	assert.deepStrictEqual(pixel, {x:2569, y:1444})
}
function testHexAxial(tc) {
	let h, axial
	// Pointy
	hex.configure(50, 1.0, {x:0, y:0}, false)
	h = {x:44, y:29}
	axial = hex.hexToAxial(h)
	assert.deepStrictEqual(axial, {r:29, q:30})
	h = hex.axialToHex(axial)
	assert.deepStrictEqual(h, {x:44, y:29})
	// Flat
	hex.configure(50, 1.0, {x:0, y:0}, true)
	h = {x:4, y:0}
	axial = hex.hexToAxial(h)
	assert.deepStrictEqual(axial, {r:-2, q:4})
	h = hex.axialToHex(axial)
	assert.deepStrictEqual(h, {x:4, y:0})
}

const testCases = [
	{msg:"Pixel/Hex conversion", fn:testPixelHex},
	{msg:"Hex/Axial conversion", fn:testHexAxial},
];
var failed = 0
for (const tc of testCases) {
	let ok = true
	try {
		tc.fn(tc);
	} catch (err) {
		console.log(`FAILED: ${tc.msg}:`, err.message)
		failed++
		//throw err;	  // To fail-fast
	}
}
if (failed == 0) {
	console.log("OK")
} else {
	console.log(`Failed test-cases: ${failed}`)
}
