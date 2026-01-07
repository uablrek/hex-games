/*
  Invoke with: node --localstorage-file=lstore test-rdtr.js

  Before testing run a program (once) with:
    localStorage.setItem("nodejsTest", "yes")
  then keep the "lstore" file

  This tells rdtr.js that the Web API is limited, e.g "new Image()"
  doesn't work.
*/

import assert from 'node:assert/strict'
import * as rdtr from './rdtr.js';

function testPixelHex(tc) {
	// This function is dependent on the map size (and --scale). It
	// will (and should) fail if the map size is changed.
	let pixel = {x:2563, y:1434}
	let hex = rdtr.pixelToHex(pixel)
	assert.deepStrictEqual(hex, {x:44, y:29})
	// When converted back the "near hex" pixel should be converted to
	// the hex center
	pixel = rdtr.hexToPixel(hex)
	assert.deepStrictEqual(pixel, {x:2555, y:1450})
}
function testHexAxial(tc) {
	let hex = {x:44, y:29}
	let axial = rdtr.hexToAxial(hex)
	assert.deepStrictEqual(axial, {r:29, q:30})
	hex = rdtr.axialToHex(axial)
	assert.deepStrictEqual(hex, {x:44, y:29})
}
function testUnitFind(tc) {
	rdtr.unitUnselectAll()
	let u, str
	u = rdtr.unitFromStr("fr,inf,2-3,Alp")
	assert(u)
	assert.equal(u.i, 0)
	u = rdtr.unitFromStr("fr,inf,2-3")
	assert.equal(u.i, 1)
	u = rdtr.unitFromStr("sv,inf") // invalid nat
	assert(!u)
	u = rdtr.unitFromStr("ge,nuk") // invalid type
	assert(!u)
	u = rdtr.unitFromStr("su,nav,1")
	assert.equal(u.i, 199)
	u = rdtr.unitFromStr("su,nav,1")
	assert.equal(u.i, 200)
	u = rdtr.unitFromStr("su,nav,1") // runned out of 1-boats
	assert(!u)
	u = rdtr.unitFromStr("uk,ab")
	assert.equal(u.i, 420)
	u = rdtr.unitFromStr("ge,pz,4-6")
	str = rdtr.unitToStr(u.u)
	assert.equal(str, "ge,pz,4-6,57")
	u = rdtr.unitFromStr("uk,mec")
	assert.equal(u.i, 472)
	str = rdtr.unitToStr(u.u)
	assert.equal(str, "uk,mec,2-5,Egypt")
	u = rdtr.unitFromStr("nu,inf,1") // (it works, but don't do this)
	assert.equal(u.i, 254)
	str = rdtr.unitToStr(u.u)
	assert.equal(str, "nu,inf,1-3")	
}

// (this is the "standard" way in golang)
const testCases = [
	{msg:"Pixel/Hex conversion", fn:testPixelHex},
	{msg:"Hex/Axial conversion", fn:testHexAxial},
	{msg:"Find unit(s) from string", fn:testUnitFind},
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
