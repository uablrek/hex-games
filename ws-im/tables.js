// SPDX-License-Identifier: CC-BY-4.0.

// Data tables. These MAY be imported from json

// ----------------------------------------------------------------------
// Ship class data
// The "cid" MUST be unique per class table
// ii=image-identifier, car=carronades, pv=point-values
// These values can (and will) be overridden for individual ships

// The "Napoleonic Period" from p31 in the 1975 AH rules
const classTable_ah_napoleonic = [
	{cid:"br-sol1-110", class:"SOL1", nguns: 110, nat:"br", ii:"sol", hull:18, crew:"6-6-5", guns:12, car:1, rigging:"9-9-9", pv:[38,35,28,26,23], depth: 24},
	{cid:"br-sol1-100", class:"SOL1", nguns: 100, nat:"br", ii:"sol", hull:17, crew:"6-6-5", guns:11, car:1, rigging:"8-8-8", pv:[35,32,26,24,22], depth: 23},
	{cid:"br-sol1-98", class:"SOL1", nguns: 98, nat:"br", ii:"sol", hull:16, crew:"5-5-5", guns:10, car:1, rigging:"8-8-8", pv:[33,30,24,23,20], depth: 22},
	{cid:"br-sol2-80", class:"SOL2", nguns: 80, nat:"br", ii:"sol", hull:16, crew:"5-5-4", guns:10, car:1, rigging:"8-8-8", pv:[34,31,24,23,21], depth: 21},
	{cid:"br-sol2-74-l", class:"SOL2", nguns: 74, nat:"br", ii:"sol", hull:14, crew:"5-4-4", guns:9, car:2, rigging:"7-7-7", pv:[30,29,23,21,19], depth: 22},
	{cid:"br-sol2-74", class:"SOL2", nguns: 74, nat:"br", ii:"sol", hull:14, crew:"4-4-4", guns:8, car:2, rigging:"7-7-7", pv:[29,27,22,20,18], depth: 20},
	{cid:"br-sol2-64", class:"SOL2", nguns: 64, nat:"br", ii:"sol", hull:11, crew:"4-3-3", guns:6, car:2, rigging:"7-7-7", pv:[22,20,17,15,13], depth: 19},
	{cid:"br-f3-36", class:"F3", nguns: 36, nat:"br", ii:"f", hull:7, crew:"2-2-1", guns:2, car:1, rigging:"5-5-5-5", pv:[13,11,10,9,8], depth: 13},

	{cid:"fr-sol2-80", class:"SOL2", nguns: 80, nat:"fr", ii: "sol", hull:16, crew:"6-6-5", guns:11, car:1, rigging:"7-7-7", pv:[36,33,27,25,23], depth: 23},
	{cid:"fr-sol2-74", class:"SOL2", nguns: 74, nat:"fr", ii: "sol", hull:14, crew:"5-5-4", guns:10, car:1, rigging:"7-7-7", pv:[32,29,24,22,20], depth: 21},
	{cid:"fr-f3-36", class:"F3", nguns: 36, nat:"fr", ii: "f", hull:8, crew:"3-2-2", guns:2, car:1, rigging:"5-5-5-5", pv:[17,15,13,12,10], depth: 17},

	{cid:"sp-sol1-130", class:"SOL1", nguns: 130, nat:"sp", ii: "sol", hull:20, crew:"8-7-7", guns:13, rigging:"10-10-10", pv:[42,38,32,30,27], depth: 25},
	{cid:"sp-sol1-112", class:"SOL1", nguns: 112, nat:"sp", ii: "sol", hull:18, crew:"6-6-6", guns:12, rigging:"9-9-9", pv:[38,35,29,27,25], depth: 23},
	{cid:"sp-sol1-100", class:"SOL1", nguns: 100, nat:"sp", ii: "sol", hull:16, crew:"6-6-5", guns:10, rigging:"8-8-8", pv:[36,33,26,25,23], depth: 23},
	{cid:"sp-sol2-80", class:"SOL2", nguns: 80, nat:"sp", ii: "sol", hull:15, crew:"5-5-4", guns:10, rigging:"7-7-7", pv:[34,31,24,23,21], depth: 21},
	{cid:"sp-sol2-74-l", class:"SOL2", nguns: 74, nat:"sp", ii: "sol", hull:14, crew:"5-4-4", guns:8, car:2, rigging:"7-7-7", pv:[33,30,22,20,18], depth: 22},
	{cid:"sp-sol2-74", class:"SOL2", nguns: 74, nat:"sp", ii: "sol", hull:13, crew:"4-4-4", guns:8, rigging:"7-7-7", pv:[29,26,20,18,16], depth: 21},

	{cid:"us-f4-38", class:"F4", nguns: 38, nat:"us", ii:"f", hull:9, crew:"3-3-3", guns:3, car:3, rigging:"5-5-5-5", pv:[18,15,14,13,11], depth: 17},
]
export const shipClasses = {
	ah_napoleonic: classTable_ah_napoleonic,
}

// ----------------------------------------------------------------------
// Combat tables for basic rules

function getHdtBasic(guns) {
	if (guns < 1) return hdtBasic.guns0
	if (guns < 4) return hdtBasic.guns1_3
	if (guns < 7) return hdtBasic.guns4_6
	if (guns < 10) return hdtBasic.guns7_9
	if (guns < 13) return hdtBasic.guns10_12
	return hdtBasic.guns13_
}

const hdtBasic = {
	guns0: {
		range: [-9, -9, -9, -9, -9, -9, -9],
		cq: {El: 0, Cr: 0, Av: 0, Gr:0, Pr: -1},
		initialBr: 0,
		rake: 0,
	},
	guns1_3: {
		range: [1, 1, 0, -1, -2, -2, -3],
		cq: {El: 1, Cr: 1, Av: 0, Gr:0, Pr: -1},
		initialBr: 1,
		rake: 1,
	},
	guns4_6: {
		range: [2, 2, 1, 0, -1, -1, -2],
		cq: {El: 2, Cr: 1, Av: 0, Gr:0, Pr: -1},
		initialBr: 1,
		rake: 2,
	},
	guns7_9: {
		range: [3, 2, 1, 0, -1, -1, -2],
		cq: {El: 2, Cr: 2, Av: 0, Gr:-1, Pr: -1},
		initialBr: 2,
		rake: 3,
	},
	guns10_12: {
		range: [4, 3, 2, 1, 0, 0, -1],
		cq: {El: 2, Cr: 2, Av: 0, Gr:-1, Pr: -2},
		initialBr: 2,
		rake: 4,
	},
	guns13_: {
		range: [5, 4, 3, 2, 1, 1, 0],
		cq: {El: 3, Cr: 2, Av: 0, Gr:-1, Pr: -2},
		initialBr: 2,
		rake: 5,
	},
}

const hitTablesBasic = [
	{							// 0
		hull: [
			"0",
			"0",
			"0",
			"C",
			"H",
			"G",
		],
		rigging: [
			"0",
			"0",
			"0",
			"0",
			"R",
			"C",
		],
	},
	{							// 1
		hull: [
			"0",
			"0",
			"G",
			"H",
			"H-C",
			"H-R",
		],
		rigging: [
			"0",
			"0",
			"R",
			"C",
			"R-H",
			"2R",
		],
	},
	{							// 2
		hull: [
			"H",
			"G",
			"H-C",
			"2H",
			"2H-R",
			"2H-G",
		],
		rigging: [
			"0",
			"R",
			"2R",
			"R-G",
			"2R-C",
			"2R-H",
		],
	},
	{							// 3
		hull: [
			"H-G",
			"2H",
			"H-G-C",
			"2H-R",
			"3H-C",
			"2H-2G",
		],
		rigging: [
			"R-H",
			"2R",
			"2R-G",
			"3R",
			"2R-C",
			"4R",
		],
	},
	{							// 4
		hull: [
			"2H-R",
			"H-G-C",
			"2H-R-G",
			"3H-G",
			"4H-C",
			"2H-2G-C",
		],
		rigging: [
			"3R",
			"2R-H",
			"3R-G",
			"3R-C",
			"2R-G-H",
			"5R",
		],
	},
	{							// 5
		hull: [
			"2H-C-G",
			"2H-2G",
			"2H-G-C-R",
			"3H-R-G",
			"4H-G-R",
			"3H-2C-G",
		],
		rigging: [
			"3R-G",
			"4R",
			"4R-H",
			"4R-G",
			"4R-C",
			"5R-H",
		],
	},
	{							// 6
		hull: [
			"2H-2G-C",
			"3H-2R-C",
			"4H-2G",
			"3H-2C-G",
			"5H-R-C",
			"3H-2G-R-C",
		],
		rigging: [
			"3R-H-G",
			"4R-H",
			"5R-C",
			"4R-G-H",
			"5R-H",
			"5R-2G",
		],
	},
	{							// 7
		hull: [
			"2H-3G-C",
			"3H-2C-R",
			"4H-3R",
			"3H-3G-C",
			"4H-2C-G",
			"3H-3G-C-R",
		],
		rigging: [
			"4R-H-G",
			"4R-H-C",
			"5R-2H",
			"5R-G-C",
			"6R-G",
			"7R-H",
		],
	},
	{							// 8
		hull: [
			"4H-2G-C",
			"5H-R-C",
			"4H-3G-C",
			"5H-2R-G",
			"6H-2G-R",
			"4H-2G-C-R",
		],
		rigging: [
			"5R-H-C",
			"6R-G",
			"6R-H-G",
			"6R-H-C",
			"5R-2H-G",
			"7R-H-G",
		],
	},
]

// ----------------------------------------------------------------------
// Init

export let getHdt = getHdtBasic
export let hitTables = hitTablesBasic
