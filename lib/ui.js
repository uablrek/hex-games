// SPDX-License-Identifier: CC-BY-4.0.
/*
  Uset Interface (UI) functions for:
  https://github.com/uablrek/hex-games/
 */

import Konva from 'konva'

export let board
export let map

export function stage(obj = {}) {
	const conf = {
		container: 'container',
		width: window.innerWidth,
		height: window.innerHeight,
	}
	for (let p in obj) conf[p] = obj[p]
	let stage = new Konva.Stage(conf)
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

let keyDown = []
let keyUp = []

function keydown(e) {
	if (e.repeat) return
	for (const kf of keyDown) {
		if (e.key == kf.key) {
			kf.fn(e)
			return
		}
	}
}
function keyup(e) {
	if (e.repeat) return
	for (const kf of keyUp) {
		if (e.key == kf.key) {
			kf.fn(e)
			return
		}
	}
}

export function setKeys(keyDownFn, keyUpFn) {
	keyDown.push(...keyDownFn)
	if (keyUpFn) keyUp.push(...keyUpFn)
}
export function clearKeys() {
	keyDown = []
	keyUp = []
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

