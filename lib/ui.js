// SPDX-License-Identifier: CC-BY-4.0.
/*
  Uset Interface (UI) functions for:
  https://github.com/uablrek/hex-games/
 */

import Konva from 'konva'

export let board
export let map
export let stage
export let info

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
	info = new Konva.Layer()
	stage.add(info)	
	stage.container().tabIndex = 1
	stage.container().focus()
	stage.container().addEventListener("keydown", keydown)
	stage.container().addEventListener("keyup", keyup)
	return board
}

const keyDown = new Map()
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
export function removeKeys(...keys) {
	for (const key of keys) {
		keyDown.delete(key)
		keyUp.delete(key)
	}
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
// return the center position on screen. If 'shape' is given the
// position take the shape size into account.
// NOTE: the center of the *board* will differ!
export function center(shape) {
	const pos = {x:stage.width()/2, y:stage.height()/2}
	if (shape) {
		pos.x -= shape.width()/2
		pos.y -= shape.height()/2
	}
	return pos
}

// ----------------------------------------------------------------------
// Help text from file

// Format:
//
// |key|
// A potentially long help text
// ^This is on a new line
// |seq-name/step-name|
// A sequence step help text
// ...
//
// The file is imported and parsed:
// import helpTxt from './help.txt'
// ui.parseHelp(helpTxt)
const help = new Map()
export const env = new Map()
export function parseHelp(shelp) {
	shelp = shelp.replaceAll('\n', ' ')
	shelp = shelp.replaceAll('^', '\n')
	const items = shelp.split('|')
	for (let i = 1; i < items.length; i += 2) {
		help.set(items[i], items[i+1].trim())
	}
}
// Key may be any unique text, e.g. "seq-name/step-name"
// env is a Map() of words to substitute
export function getHelp(key, _env = env) {
	if (!help.has(key)) return ''
	let txt = help.get(key)
	for (const [k,v] of _env.entries()) txt = txt.replace(k,v)
	return txt
}
