// SPDX-License-Identifier: CC0-1.0.
/*
  Basic drag-and-drop demo. The counters will snap to the hearest hex
  when dropped.
 */
import Konva from 'konva';
import * as rdtr from './rdtr.js';

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,
});
const board = new Konva.Layer({
	draggable: true,
});
stage.add(board);
board.add(rdtr.map);

deployment = [
	// French
	{i:1, rc: {r:"O", q:19}},
	{i:2, rc: {r:"P", q:19}},
	{i:3, rc: {r:"Q", q:19}},
	{i:16, rc: {r:"R", q:19}},
	{i:20, rc: {r:"S", q:19}},
	{i:30, rc: {r:"T", q:19}},
	// Neutrals
	{i:260, rc: {r:"L", q:25}},
	{i:261, rc: {r:"M", q:25}},
	{i:262, rc: {r:"N", q:25}},
	{i:281, rc: {r:"O", q:25}},
	// Germans
	{i:480, rc: {r:"K", q:30}},
	{i:481, rc: {r:"L", q:30}},
	{i:482, rc: {r:"M", q:30}},
	{i:530, rc: {r:"N", q:30}},
	{i:531, rc: {r:"O", q:30}},
	{i:540, rc: {r:"P", q:30}},
	{i:515, rc: {r:"Q", q:30}},	
	// Uk
	{i:384, rc: {r:"J", q:24}},
	{i:394, rc: {r:"K", q:23}},
	{i:430, rc: {r:"L", q:22}},	
]
for (d of deployment) {
	u = rdtr.units[d.i]
	rdtr.unitPlaceRdtr(u, d.rc, board)
}
