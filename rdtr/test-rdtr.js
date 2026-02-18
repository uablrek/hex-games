/*
  Invoke with: node test-rdtr.js
*/

import assert from 'node:assert/strict'
import * as unit from './rdtr-unit.js'
import * as map from './rdtr-map.js'
import "konva/canvas-backend"
unit.init()

function testPixelHex(tc) {
	// This function is dependent on the map size (and --scale). It
	// will (and should) fail if the map size is changed.
	let pixel = {x:2563, y:1434}
	let hex = map.pixelToHex(pixel)
	assert.deepStrictEqual(hex, {x:44, y:29})
	// When converted back the "near hex" pixel should be converted to
	// the hex center
	pixel = map.hexToPixel(hex)
	assert.deepStrictEqual(pixel, {x:2555, y:1450})
}
function testHexAxial(tc) {
	let hex = {x:44, y:29}
	let axial = map.hexToAxial(hex)
	assert.deepStrictEqual(axial, {r:29, q:30})
	hex = map.axialToHex(axial)
	assert.deepStrictEqual(hex, {x:44, y:29})
}
function testUnitFind(tc) {
	unit.unselectAll()
	let selectFilter=(u) => u.selected
	let u, str
	u = unit.fromStr("fr,inf,2-3,Alp")
	assert(u)
	assert.equal(u.i, 0)
	u = unit.fromStr("fr,inf,2-3,Alp")
	assert(u)
	assert.equal(u.i, 0)
	u = unit.fromStr("fr,inf,2-3,Alp", selectFilter)
	assert(!u)					// already selected
	u = unit.fromStr("fr,inf,2-3", selectFilter)
	assert.equal(u.i, 1)
	u = unit.fromStr("sv,inf") // invalid nat
	assert(!u)
	u = unit.fromStr("ge,nuk") // invalid type
	assert(!u)
	u = unit.fromStr("su,nav,1", selectFilter)
	assert.equal(u.i, 199)
	u = unit.fromStr("su,nav,1", selectFilter)
	assert.equal(u.i, 200)
	u = unit.fromStr("su,nav,1", selectFilter) // runned out of 1-boats
	assert(!u)
	u = unit.fromStr("uk,ab")
	assert.equal(u.i, 420)
	u = unit.fromStr("ge,pz,4-6")
	str = unit.toStr(u)
	assert.equal(str, "ge,pz,4-6,57")
	u = unit.fromStr("uk,mec")
	assert.equal(u.i, 472)
	str = unit.toStr(u)
	assert.equal(str, "uk,mec,2-5,Egypt")
	u = unit.fromStr("nu,inf,1") // (it works, but don't do this)
	assert.equal(u.i, 254)
	str = unit.toStr(u)
	assert.equal(str, "nu,inf,1-3")
	u = unit.fromStr("fr,pz,3-5,1")
	assert(u)
}
function testUnitCompare(tc) {
	let u = unit.fromStr("ge,pz,4-6")
	assert(u == unit.units[u.i]) // compares references
	let s = new Set([unit.units[0], unit.units[1], unit.units[2]])
	assert.equal(s.size, 3)
	s.add(unit.units[0])
	assert.equal(s.size, 3)
	for (const u1 of s) {
		assert(u1 == unit.units[u1.i]) // Yes, this is a unit reference
	}
}
function testUnitBox(tc) {
	let u, rc
	u = unit.fromStr("ge,inf,3-3")
	rc = unit.UnitBoxMajor.getRowCol(u)
	assert.deepStrictEqual(rc, {col: 0, row: 0})
	u = unit.fromStr("ge,inf,1-3")
	rc = unit.UnitBoxMajor.getRowCol(u)
	assert.deepStrictEqual(rc, {col: 7, row: 0})
	u = unit.fromStr("su,pz,4-5")
	rc = unit.UnitBoxMajor.getRowCol(u)
	assert.deepStrictEqual(rc, {col: 3, row: 3})
	u = unit.fromStr("su,pz,4-6")
	rc = unit.UnitBoxMajor.getRowCol(u)
	assert.deepStrictEqual(rc, {col: 10, row: 3})

	u = unit.fromStr("ge,air,5-4")
	rc = unit.UnitBoxAir.getRowCol(u)
	assert.deepStrictEqual(rc, {col: 0, row: 0})
	u = unit.fromStr("ge,ab")
	rc = unit.UnitBoxAir.getRowCol(u)
	assert.deepStrictEqual(rc, {col: 4, row: 0})

	u = unit.fromStr("nu,inf,1-3")
	rc = unit.UnitBoxNeutrals.getRowCol(u)
	assert.deepStrictEqual(rc, {col: 1, row: 0})
}
function testFronts(tc) {
	assert.equal(map.front({x:21,y:9}), "west")
	assert.equal(map.front({x:22,y:9}), "east")
	assert.equal(map.front({x:31,y:20}), "east")
	assert.equal(map.front({x:30,y:20}), "med")
	assert.equal(map.front({x:11,y:20}), "west")
	assert.equal(map.front({x:10,y:20}), "med")
	assert.equal(map.front({x:26,y:11}), "east")
	assert.equal(map.front({x:18,y:11}), "west")
}

// (this is the "standard" way in golang)
const testCases = [
	{msg:"Pixel/Hex conversion", fn:testPixelHex},
	{msg:"Hex/Axial conversion", fn:testHexAxial},
	{msg:"Find unit(s) from string", fn:testUnitFind},
	{msg:"Compare unit object references", fn:testUnitCompare},
	{msg:"UnitBox", fn:testUnitBox},
	{msg:"Fronts", fn:testFronts},
]
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
