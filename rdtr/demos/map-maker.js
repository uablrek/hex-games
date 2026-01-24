// SPDX-License-Identifier: CC0-1.0.
/*
  This is the map-maker program for:
  https://github.com/uablrek/hex-games/tree/main/rdtr
  It is a development help-program, and it will become obsolete once the
  map array is defined. It is preserved as documentation of the development
  process
 */
import Konva from 'konva';
import * as rdtr from './rdtr.js';
import * as map from './rdtr-map.js';
import * as box from './textbox.js';

// {hex: {x:0,y:0}, nat:"", edges:"" prop:""},
// Properties:
//   C - Capital
//   p - Port
//   B - Beach
//   M - Mountain
//   m - Marsh
//   c - City
//   O - Objective
//   F - Fort (Gibraltar, Malta)
//   f - Fort (Maginot line, West wall, Sevastopol, Leningrad)
//   s - Shore (fleets may transit)
//   v - Vichy
//   q - Quattra
//   E - Eastern Europe
//   2 - Occupied 1942
//   4 - Occupied 1944
//   e - Eastern Front

// Nations:
//   ge - Germany w
//   fr - France w
//   it - Italy m
//   po - Poland e
//   uk - UK w
//   sw - Sweden e
//   su - Sovjet Union e
//   no - Norway w
//   dk - Denmark w
//   nl - Netherlands w
//   be - Belgium w
//   lx - Luxenbourg w
//   ir - Ireland w
//   sp - Spain m
//   fi - Finland e
//   bl - Baltic States e
//   hu - Hungary w
//   ru - Rumania m
//   tu - Turkey m
//   gr - Greece m
//   yu - Yogoslavia m
//   bu - Bulgaria m
//   gi - Gibralter m
//   ml - Malta m
//   mo - Morocco m
//   al - Algeria m
//   ts - Tunisia m
//   le - Lebanon/Syria m
//   pe - Persia m
//   iq - Iraq m
//   eg - Egypt m
//   cy - Cyprus m
//   li - Libya m
//   ar - Arabia m
//   pa - Palestine m
//   tr - Transjordan m
//   pl - Portugal m
//   sz - Swizerland x
let mapData = require('./rdtr-map.json')

const marker = new Konva.Circle({
	radius: 10,
    fill: "red",
    stroke: 'black',
    stroke_width: 1
})

function hexEqual(h1, h2) {
	if (h1.x != h2.x) return false
	if (h1.y != h2.y) return false
	return true
}
// Get a defined hex object, or create a new one
function getHex(hex) {
	for (const h of mapData) {
		if (hexEqual(hex, h.hex)) return h
	}
	let h = {hex:hex}
	mapData.push(h)
	return h
}
function saveMap() {
	const json = JSON.stringify(mapData)
	const blob = new Blob([json], { type: 'application/json' })
	rdtr.download(blob, 'rdtr-map.json')
}

var hexInfoBox
function boxDestroy(e) {
	if (e == hexInfoBox) hexInfoBox = null
}
box.destroyCallback(boxDestroy)
function createHexInfoBox() {
	if (hexInfoBox) return
	hexInfoBox = box.info("Hex Information", "", {
		fontFamily: 'monospace',
		width: 500,
		x: 400,
		y: 400,
	})
	board.add(hexInfoBox)
}

function keydown(e) {
	if (e.key == "s") {
		if (e.repeat) return
		saveMap()
		return
	}
	if (e.key == "h") {
		if (e.repeat) return
		createHexInfoBox()
		return
	}
	if (e.key == '.' || e.key == 'x' || e.key == 'r' || e.key == ' ' || e.key == 'c') {
		if (e.repeat) return
		setEdge(e.key)
		return
	}
}

function markNat(nat) {
	const txt = new Konva.Text({
		fontStyle: 'bold',
		fontSize: 20,
		fill: 'red',
		text: nat,
	})
	const offset = 9
	for (const h of mapData) {
		if (h.nat != nat) continue
		const pos = map.hexToPixel(h.hex)
		board.add(txt.clone({
			x: pos.x - offset,
			y: pos.y - offset,
		}))
	}
}
function markAllNats() {
	const allNats = new Set()
	for (const h of mapData) {
		if (!h.nat) {
			const r = map.hexToRdtr(h.hex)
			console.log(`No nat in ${r.r},${r.q}`)
		} else
			allNats.add(h.nat)
	}
	console.log(allNats)
	for (const n of allNats) {
		markNat(n)
	}
}
function markProp(p) {
	const txt = new Konva.Text({
		fontStyle: 'bold',
		fontSize: 20,
		fill: 'red',
		text: p,
	})
	const offset = 9
	for (const h of mapData) {
		if (!h.prop) continue
		if (!h.prop.includes(p)) continue
		const pos = map.hexToPixel(h.hex)
		board.add(txt.clone({
			x: pos.x - offset,
			y: pos.y - offset,
		}))
	}	
}
function markEdge(p) {
	const txt = new Konva.Text({
		fontStyle: 'bold',
		fontSize: 20,
		fill: 'red',
		text: 'E',
	})
	const offset = 9
	for (const h of mapData) {
		if (!h.edges) continue
		const pos = map.hexToPixel(h.hex)
		board.add(txt.clone({
			x: pos.x - offset,
			y: pos.y - offset,
		}))
	}	
}
function moveMarker(h) {
	let pos = map.hexToPixel(h)
	marker.position(pos)
	if (!marker.getParent()) {
		board.add(marker)
	}
}
function setMarker(h) {
	let pos = map.hexToPixel(h)
	board.add(marker.clone({
		position: pos,
	}))
}
function updateHexInfo(h) {
	if (!hexInfoBox) return
	const p = map.hexToRdtr(h.hex)
	let str = `${p.r},${p.q} - `
	if (h.nat) str += `${h.nat}`
	if (h.prop) str += `, prop: ${h.prop}`
	if (h.edges) str += `, edges: ${h.edges}`
	let txtObj = hexInfoBox.findOne('.text')
	txtObj.text(str)
}
var edgeHex = null
var edgeNo = 0
const edgeArrow = new Konva.Path({
	fill: 'green',
	stroke: 'black',
	strokeWidth: 3,
	data: "m 10 0 l 5 0 l -15 -20 l -15 20 l 5 0 l 0 20 l 20 0 l z",
	rotate: 30
})
function selectEdgeHex(h) {
	if (edgeHex == h) return
	if (edgeHex) {
		if (edgeNo == 0) {
			// No updates, restore the arrow
			edgeArrow.remove()
			edgeArrow.rotate(-30)
		} else {
			alert("Define all edges first")
			return
		}
	}
	edgeHex = h
	edgeNo = 0
	let pos = map.hexToPixel(h.hex)
	edgeArrow.position(pos)
	edgeArrow.rotate(30)
	board.add(edgeArrow)
	updateHexInfo(edgeHex)
}
function setEdge(c) {
	if (!edgeHex) return
	if (c == ' ') c = '.'
	if (edgeNo == 0) edgeHex.edges=''
	edgeHex.edges += c
	updateHexInfo(edgeHex)
	edgeNo = edgeNo + 1
	if (edgeNo > 5) {
		edgeArrow.remove()
		edgeHex = null
		edgeNo = 0
		edgeArrow.rotate(30)
	} else {
		edgeArrow.rotate(60)
	}
}
// return true if there are any double-character in the string
function hasDoubles(str) {
	let s = new Set(str.split(''))
	return str.length != s.size
}
function markDoubles() {
	for (const h of mapData) {
		if (!h.prop) continue
		if (hasDoubles(h.prop)) {
			setMarker(h.hex)
		}
	}
}

// ----------------------------------------------------------------------
// "main"
var stage
;(async () => {
	const mapImg = new Image();
	mapImg.src = './rdtr-map.png'
	await new Promise(resolve => mapImg.onload = resolve)
	stage = new Konva.Stage({
		container: container,
		width: window.innerWidth,
		height: window.innerHeight,
	});
	board = new Konva.Layer({
		draggable: true,
	});
	stage.add(board);
	board.add(new Konva.Image({
		image: mapImg,
	}))

	stage.container().tabIndex = 1
	stage.container().focus();
	stage.container().addEventListener("keydown", keydown)

	let prop = '4', nat = 'ge', sel = 0, selInfo
	switch (sel) {
	case 0:
		//markDoubles()
		//markEdge()
		//markProp(prop)
		selInfo = 'Hex Info'
		break
	case 1:
		selInfo = 'Edge Update'
		markEdge()
		break
	case 2:
		selInfo = 'Nat Update'
		markAllNats()
		break
	case 3:
		selInfo = 'Prop Add'
		markProp(prop)
		break
	case 4:
		selInfo = 'Prop Remove'
		markProp(prop)
		break
	}
	board.add(box.info("Function", `${selInfo} - prop: ${prop}, nat: ${nat}`))
	createHexInfoBox()
	board.on('click', function() {
        let pos = board.getRelativePointerPosition()
		let h = map.pixelToHex(pos)
		let hex = getHex(h)
		updateHexInfo(hex)
		switch (sel) {
		case 0:
			// Show info
			moveMarker(h)
			break
		case 1:
			// Set edges
			selectEdgeHex(hex)
			break
		case 2:
			setMarker(h)
			hex.nat = nat
			break
		case 3:
			setMarker(h)
			if (hex.prop)
				hex.prop += prop
			else
				hex.prop = prop
			break
		case 4:
			setMarker(h)
			//delete hex.prop
			hex.prop = hex.prop.replace(prop, '')
			break
		}
		updateHexInfo(hex)
	})
})()
