// SPDX-License-Identifier: CC0-1.0.

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

