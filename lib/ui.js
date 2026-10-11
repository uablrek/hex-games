// SPDX-License-Identifier: CC-BY-4.0.
/*
  Uset Interface (UI) functions for:
  https://github.com/uablrek/hex-games/
 */

import Konva from 'konva'

export let board
export let map
export let stage

// (renamed from stage() in 5.x)
export function init(obj = {}) {
	const conf = {
		container: 'container',
		width: window.innerWidth,
		height: window.innerHeight,
	}
	for (let p in obj) conf[p] = obj[p]
	stage = new Konva.Stage(conf)
	board = new Konva.Layer({
		draggable: true,
		name: "board",
	})
	stage.add(board)
	stage.container().tabIndex = 1
	stage.container().focus()
	stage.container().addEventListener("keydown", keydown)
	stage.container().addEventListener("keyup", keyup)
	return board
}

const maps = [] 
let keyDown = new Map()
const keyUp = new Map()

function keydown(e) {
	if (e.repeat) return
	const fn = keyDown.get(e.key)
	if (fn) fn(e)
}
function keyup(e) {
	if (e.repeat) return
	const fn = keyUp.get(e.key)
	if (fn) fn(e)
}
export function setKeys(keyDownFn, keyUpFn) {
	for (const kf of keyDownFn) keyDown.set(kf.key, kf.fn)
	if (!keyUpFn) return
	for (const kf of keyUpFn) keyUp.set(kf.key, kf.fn)
}
export function pushKeys(keyDownFn) {
	maps.push(new Map(keyDown))
	setKeys(keyDownFn)
}
export function popKeys() {
	if (maps.length) keyDown = maps.pop()
}
export function clearKeys() {
	keyDown.clear()
	keyUp.clear()
}

export async function mapImage(mapData) {
	let mapImg = new Image()
	mapImg.src = mapData
	await new Promise(resolve => mapImg.onload = resolve)
	map = new Konva.Image({
		image: mapImg,
	})
	map.addName("map")
	// Pre-render the map-image - and drag seem more or less free
	map.cache()
	return map
}

