/*
  Invoke with: node test.js
*/

import assert from 'node:assert/strict'
import * as grid from '../lib/grid.js'

function testPixelHex(tc) {
	grid.configure(58.7, 0.988, {x:57, y:23})	// (rdtr values)
	let pixel = {x:2563, y:1434}
	let h = grid.pixelToHex(pixel)
	assert.deepStrictEqual(h, {x:44, y:29})
	// When converted back the "near hex" pixel should be converted to
	// the hex center. The correct pos is {x:2555, y:1450}
	pixel = grid.hexToPixel(h)
	assert.deepStrictEqual(pixel, {x:2555, y:1450})
}
function testHexAxial(tc) {
	let h, axial
	// Pointy
	grid.configure(50, 1.0, {x:0, y:0}, false)
	h = {x:44, y:29}
	axial = grid.hexToAxial(h)
	assert.deepStrictEqual(axial, {r:29, q:30})
	h = grid.axialToHex(axial)
	assert.deepStrictEqual(h, {x:44, y:29})
	// Flat
	grid.configure(50, 1.0, {x:0, y:0}, true)
	h = {x:4, y:0}
	axial = grid.hexToAxial(h)
	assert.deepStrictEqual(axial, {r:-2, q:4})
	h = grid.axialToHex(axial)
	assert.deepStrictEqual(h, {x:4, y:0})
}

function testNeighbours(tc) {
	let ax = {r:10, q:10}
	let n = grid.neighboursAxial(ax)
	assert.equal(n.length, 6)
	let exp = [
		{r:9 ,q:11},
		{r:10 ,q:11},
		{r:11 ,q:10},
		{r:11 ,q:9},
		{r:10 ,q:9},
		{r:9 ,q:10},
	]
	assert.deepStrictEqual(n, exp)
	// block edge 2
	grid.mapFunctions((ax)=>ax, (me,h,i)=>{return i==2})
	n = grid.neighboursAxial(ax)
	exp[2] = undefined
	assert.deepStrictEqual(n, exp)
	/*
	  grid.inRangeAxial() is clumbersome to test fully here, but has
	  been tested by marking hexes on a grid in a browser
	*/
	let inRange = grid.inRangeAxial(1, ax)
	assert.equal(inRange.size, 7)
	inRange = grid.inRangeAxial(2, ax)
	assert.equal(inRange.size, 7+12)
	inRange = grid.inRangeAxial(3, ax)
	assert.equal(inRange.size, 7+12+18)
	inRange = grid.inRangeAxial(4, ax)
	assert.equal(inRange.size, 7+12+18+24)
}

// Rudementary tests. Should be tested in a browser
function testMovement(tc) {
	// Create a rhombus map for testing. Please see:
	// https://www.redblobgames.com/grids/hexagons/#map-storage
	var map = new Array(21)
	for (let r = 0; r <=20; r++) {
		map[r] = new Array(21)
		for (let q = 0; q <=20; q++) {
			if (r > 10)
				map[r][q] = {ax: {r:r, q:q}, block:true}
			else
				map[r][q] = {ax: {r:r, q:q}}
		}
	}
	
	function getAxial(ax) {
		return map[ax.r][ax.q]
	}
	function blocked(me, h, i) {
		return h.block
	}
	function removeD() {
		for (let r = 0; r <=20; r++) {
			for (let q = 0; q <=20; q++) {
				delete map[r][q].d
			}
		}
	}
	function getMovementCost(me,n,i) {
		return 1
	}
	grid.mapFunctions(getAxial, blocked, getMovementCost, removeD)
	const ax = {r:10, q:10}
	let s = grid.movementAxial(1, ax)
	assert.equal(s.size, 4)
	s = grid.movementAxial(2, ax)
	assert.equal(s.size, 11)
}

const testCases = [
	{msg:"Pixel/Hex conversion", fn:testPixelHex},
	{msg:"Hex/Axial conversion", fn:testHexAxial},
	{msg:"Neighbours", fn:testNeighbours},
	{msg:"Movement", fn:testMovement},
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
