// SPDX-License-Identifier: CC-BY-4.0.

import Konva from 'konva'
import {ui, box, sequence, grid, die} from '@uablrek/hex-games'
import * as map from './map.js'
import * as ship from './ship.js'
import * as scenario from './scenario.js'
import * as tables from './tables.js'
import * as ai from './ai.js'
import help from './help.txt'
import crashAudioData from './freesoundsxx-rubble-crash-275691.mp3'
import gunAudioData from './universfield-powerful-cannon-shot-352459.mp3'

// ----------------------------------------------------------------------
// UI
export const board = ui.stage()
export const info = new Konva.Layer({name: "info"})
board.getStage().add(info)
sequence.parseSeqHelp(help)
let selectedShip
export let sc				// Current Scenario
export let ships			// The ship array. Initiated from scenario
let soundCrash				// Sound effect on collision
let soundGun				// Sound effect on gunfire
let hexToShip				// A hex (map-object) -> ship Map()
export let me = ''          // The players nat(). ''=both (solitarie game)
let aiInPlay = false		// Disable user input when AI is in play
const release = {version:"4.0.0", date:"2026-06-18"}

let infoBox
function createInfoBox() {
	infoBox = box.info({
		x: window.innerWidth - 370,
		y: 30,
		width: 350,
		height: 640,
		destroyable: false,
		label: "Welcome",
	})
	info.add(infoBox)
}
let helpTxt = ""
function updateInfoBox() {
	let txt = helpTxt
	if (selectedShip) {
		const s = selectedShip
		txt += `\n\nSHIP: ${s.name} (${s.pv})\n`
		txt += `${s.class}, ${s.nguns} guns\n`
		txt += `Hull: ${s.s.hull}\n`
		if (s.car)
			txt += `Guns: L ${s.s.guns.l}(${s.s.car.l}), R ${s.s.guns.r}(${s.s.car.r})\n`
		else
			txt += `Guns: L ${s.s.guns.l}, R ${s.s.guns.r}\n`
		txt += `Crew: ${s.cq}  ${s.s.crew.join('-')}, Rigging: ${s.s.rigg.join('-')}\n`
		// Find out the movement allowance in all aspects; A,B,C,D
		// Check full-sails and lost rigging sections
		const m = {}
		if (s.fullSails) {
			// We can't have any rigging sections lost, just clone
			for (const d of ['A', 'B', 'C', 'D']) m[d] = s.mov.full[d]
		} else {
			let loss = 0
			for (let sect of s.s.rigg) if (sect == 0) loss++
			for (const d of ['A', 'B', 'C', 'D'])
				m[d] = loss > s.mov.battle[d] ? 0 : s.mov.battle[d] - loss
		}
		txt += `Mov A:${m.A}, B:${m.B}, C:${m.C}, D:0, t:${s.mov.turn}\n`
		if (g.phase == "Planning") {
			if (me && ship.nat(s) != me)
				txt += "Enemy Ship\n"
			else if (s.surrendered)
				txt += "Surrendered\n"
			else if (s.dismasted)
				txt += "Dismasted\n"
			else {
				const mp = ship.mp(s)
				txt += `Movement: [${s.m}] (${mp.mp} t:${mp.t})\n`
				if (s.setSails) txt += `Set ${s.setSails} Sails`
			}
		}
		//const hex = map.hexToId(s.hex)
		//txt += `Hex: ${hex}, direction: ${s.d}\n`
	}
	box.update(infoBox, txt, `${g.phase}, turn ${g.turn}`)
}
let theAlertBox
function createAlertBox(txt) {
	if (theAlertBox) return
	theAlertBox = box.choice({
		x: 200,
		y: 200,
		width: 300,
		height: 200,
		text: txt
	})
	info.add(theAlertBox)
}
function boxDestroyed(box) {
	if (box == theAlertBox) theAlertBox = null
}
box.destroyCallback(boxDestroyed)

function shipOnClick(e) {
	if (g.phase == "Movement") return // (things are in motion)
	if (selectedShip) ship.unmark(selectedShip)
	selectedShip = ship.fromImg(e.target)
	ship.mark(selectedShip, board)
	updateInfoBox()
	if (g.phase == "Combat") combatShipClick(selectedShip)
}

// Keyboard
ui.setKeys([
	{key:'i', fn:map.toggleHexId},
	{key:'p', fn:map.save},
	{key:'Enter', fn:keyProceed},
	{key:'q', fn:keyProceed},
	{key:'Escape', fn:keyEscape},
	{key:'ArrowLeft', fn:keyMovement},
	{key:'ArrowRight', fn:keyMovement},
	{key:'ArrowUp', fn:keyMovement},
	{key:'ArrowDown', fn:keyMovement},
	{key:'a', fn:keyMovement},
	{key:'d', fn:keyMovement},
	{key:'w', fn:keyMovement},
	{key:'s', fn:keyMovement},
	{key:'c', fn:keyMovement},
	{key:'Backspace', fn:keyMovement},
	{key:'=', fn:keyMovement},
	{key:'b', fn:keySails},
	{key:'f', fn:keyF},
	{key:' ', fn:keySpace},
	{key:'h', fn:keyFire},
	{key:'r', fn:keyFire},
])
function keyProceed(e) {
	if (!["Welcome","Planning","Combat"].includes(g.phase)) return
	if (!me || g.phase == "Welcome") {
		sequence.nextStep()
		return
	}
	// Play against AI.
	// We are in "Planning" or "Combat" phase
	if (!aiInPlay) {
		aiInPlay = true
		ai.play()
	}
}
function keyEscape(e) {
	if (selectedShip) {
		ship.unmark(selectedShip)
		selectedShip = null
		updateInfoBox()
	}
}
function keyF(e) {
	if (g.phase == "Planning") return keySails(e)
	if (g.phase == "Combat") {
		if (!selectedShip) return
		if (fofMarkers)
			unmarkFof()
		else
			markFof(selectedShip)
	}
}
function keySpace(e) {
	if (g.phase == "Planning") {
		// Next unmoved&unfouled&ungrappled ship
		let i = 0
		if (selectedShip) {
			i = selectedShip.i
			ship.unmark(selectedShip)
			selectedShip = null
		}
		const stop = i
		do {
			i = (i + 1) % ships.length
			const s = ships[i]
			if (me && me != ship.nat(s)) continue
			if (!s.m) {
				selectedShip = s
				ship.mark(s, board)
				break
			}
		} while (i != stop)
		updateInfoBox()
		return
	}
	if (g.phase == "Combat") {
		if (!selectedShip) return
		untargetShip()
		// Select target
		const s = selectedShip
		if (me && me != ship.nat(s)) return
		s.target = null
		const nTargets = s.targets.l.length + s.targets.r.length
		if (nTargets == 0) return
		s.targetIndex++
		if (s.targetIndex >= nTargets) s.targetIndex = 0
		if (s.targetIndex >= s.targets.l.length)
			s.target = {s:s.targets.r[s.targetIndex-s.targets.l.length], b:'r'}
		else
			s.target = {s:s.targets.l[s.targetIndex], b:'l'}
		targetShip(s.target.s)
		return
	}
}
function keyFire(e) {
	if (g.phase != "Combat" || !selectedShip) return
	if (me && me != ship.nat(selectedShip)) return
	if (!selectedShip.target) return
	fire(selectedShip, e.key)
	keySpace()
}
function keyMovement(e) {
	if (g.phase != "Planning" || !selectedShip) return
	if (me && me != ship.nat(selectedShip)) return
	if (e.key == '=') {
		// Copy the movement of the selectedShip to all friendly ships.
		// If the movement can't be applied, those ships are left as-is.
		// This should simplify ships-in-line movement.
		const m = selectedShip.m
		const n = ship.nat(selectedShip)
		for (const s of ships) {
			if (ship.nat(s) != n) continue
			if (s.m) continue	// already have movement orders
			s.m = m
			const mp = ship.mp(s)
			if (mp.mp < 0) s.m = "" // not allowed for this ship
		}
		return
	}
	const s = selectedShip
	const oldm = s.m
	switch (e.key) {
	case 'ArrowLeft':
	case 'a':
		s.m += 'L'
		break
	case 'ArrowRight':
	case 'd':
		s.m += 'R'
		break
	case 'ArrowUp':
	case 'w':
		s.m += '1'
		break
	case 'ArrowDown':
	case 's':
		s.m += 'B'
		break
	case 'c':
	case 'Backspace':
		s.m = ""
		break
	}
	const mp = ship.mp(s)
	if (mp.mp < 0 || mp.t < 0)
		s.m = oldm
	else
		savedMovement = s.m
	updateInfoBox()
}
function keySails(e) {
	if (g.phase != "Planning" || !selectedShip) return
	if (me && me != ship.nat(selectedShip)) return	
	selectedShip.setSails = e.key == 'f' ? "Full" : "Battle"
	updateInfoBox()
}

const collisionMarkerTemplate = new Konva.Star({
	numPoints: 9,
	innerRadius: 10,
	outerRadius: 15,
	fill: 'red',
	offsetY: 30,
})
let collisionMarkers = null
function addCollision(chex) {
	if (!collisionMarkers) collisionMarkers = new Konva.Group()
	const pos = grid.hexToPixel(chex.hex)
	const marker = collisionMarkerTemplate.clone({
		position: pos,
	})
	marker.rotate(chex.d * 60)
	collisionMarkers.add(marker)
}
function removeCollisionMarkers() {
	if (collisionMarkers) {
		collisionMarkers.destroy()
		collisionMarkers = null
	}
}

// ----------------------------------------------------------------------
// Game related

export const g = {
	turn: 0,
	phase: "",
	wind: {},
	log: console.log,
	dbg: function(){}
}

let maxMov = 0
function moveAll(i) {
	if (i >= maxMov) {
		sequence.nextStep()
		return
	}
	ship.moveAll(i)
	setTimeout(moveAll, 600, i+1)
}

// Create a Map(hex-object -> ship) for all ships on the map.
// Note that this is "set-like", and can be used in set operatons
export function shipHexMap() {
	const smap = new Map()
	for (const s of ships) {
		if (!s.hex) continue
		smap.set(map.hex(s.hex), s)
		const st = ship.stern(s)
		smap.set(map.hex(st), s)
	}
	return smap
}

// ----------------------------------------------------------------------
// Sequences

export function updatePhase(seq) {
	g.phase = seq.currentStep.name
	helpTxt = sequence.getSeqHelp(g.phase)
	if (selectedShip) {
		ship.unmark(selectedShip)
		selectedShip = null
	}
	updateInfoBox()
}

// This is the top sequence
sequence.add(new sequence.Sequence({
	name: "game",
	steps: [
		{
			name: "Welcome",
			start: function(seq) {
				g.phase = seq.currentStep.name
				helpTxt = sequence.getSeqHelp(g.phase)
				let txt = sequence.getSeqHelp("Welcome0")
				txt += `\nVersion: ${release.version}, ${release.date}`
				txt += `\n\nSenario:\n${sc.name}\n`
				if (sc.description) txt += `${sc.description}\n`
				txt += '\n'
				txt += helpTxt
				txt += '\n\n'
				txt += sequence.getSeqHelp("zoom")
				if (me)
					txt += `\n\nYou are playing against AI, as ${me}`
				box.update(infoBox, txt, g.phase)
			},
		},
		{
			name: "New Turn",
			start: function(seq) {
				g.turn++
				seq.nextStep()
			},
		},
		{
			name: "Unfouling",
			start: sequence.proceed, // NYI
		},
		{
			name: "Planning",
			start: function(seq) {
				updatePhase(seq)
				aiInPlay = false
				savedMovement = ""
				for (const s of ships) {
					s.m = ""
					s.setSails = ""
				}
			},
		},
		{
			//name: "Collision check",
			start: function(seq) {
				for (let i = 0; i < 7; i++) {
					let chex = ship.collisionCheck(i)
					while (chex) {
						addCollision(chex)
						chex = ship.collisionCheck(i)
					}
				}
				seq.nextStep()
			}
		},
		{
			name: "Movement",
			start: function(seq) {
				updatePhase(seq)
				maxMov = 0
				for (const s of ships) {
					const l = s.m.length
					if (l > maxMov) maxMov = l
				}
				moveAll(0)
			},
			end: function(seq) {
				if (collisionMarkers) {
					board.add(collisionMarkers)
					soundCrash.currentTime = 0
					soundCrash.play()
				}
			}
		},
		{
			name: "Grappling/Ungrappling",
			start: sequence.proceed, // NYI
		},
		{
			name: "Boarding Preparation",
			start: sequence.proceed, // NYI
		},
		{
			name: "Combat",
			start: function(seq) {
				updatePhase(seq)
				aiInPlay = false
				hexToShip = shipHexMap()
				for (const s of ships) {
					s.fof = map.fireHexes(s)
					s.targets = null
					s.dmg = []
				}
			},
			end: function(seq) {
				removeCollisionMarkers()
				unmarkFof()
				untargetShip()
				applyDamage()
				for (const s of ships) {
					// (help GC)
					s.fof = null
					s.targets = null
				}
			}
		},
		{
			name: "Melee",
			start: sequence.proceed, // NYI
		},
		{
			name: "Reload",
			start: function(seq) {
				// TODO: let the user decide which side to reload, and ammo
				// For now, reload both sides (violates the rules)
				for (const s of ships) {
					s.ammo.l = 'R'
					s.ammo.r = 'R'
				}
				seq.nextStep()
			},
		},
		{
			name: "Full Sails",
			start: function(seq) {
				for (const s of ships) {
					if (s.setSails) {
						// may not set full-sails with a lost rigging section
						if (s.s.rigg[0])
							ship.fullSails(s, s.setSails == "Full")
					}
				}
				seq.nextStep()
			},
		},
		{
			name: "Transfer",
			start: sequence.proceed, // NYI
		},
		{
			start: function(seq) {
				seq.gotoStep("New Turn")
			}
		},
	],
}), true)

// ----------------------------------------------------------------------
// Combat

function mkFofmarker(n) {
	const fill = [
		"#080",
		"#770",
		"#550",
		"#800",
		"#500",
	]
	return new Konva.Circle({
		radius: 8,
		stroke: "gray",
		fill: fill[n-1],
		opacity: 0.4,
	})
}
const fofMarkerTemplate = [
	mkFofmarker(1),
	mkFofmarker(2),
	mkFofmarker(3),
	mkFofmarker(4),
	mkFofmarker(5),
]
let fofMarkers = null
function markFof(s) {
	if (fofMarkers) return
	fofMarkers = new Konva.Group()
	board.add(fofMarkers)
	for (let side of ["l", "r"]) {
		for (let [h,v] of s.fof[side]) {
			const m = fofMarkerTemplate[v - 1].clone()
			const pos = grid.hexToPixel(h.hex)
			m.position(pos)
			fofMarkers.add(m)
		}
	}
}
function unmarkFof() {
	if (fofMarkers) {
		fofMarkers.destroy()
		fofMarkers = null
	}
}
// Return an array of (enemy) ships
export function findTargets(s, fof) {
	// Create a set of all hexes containing ships, then take the
	// intersection of the fof map (which is "set-like")
	// (don't you just *love* set operations?)
	const shipHexes = new Set(hexToShip.keys())
	const inRange = shipHexes.intersection(fof)
	// Now we have all hexes with ships in range, so find the ones
	// closest to the ship
	if (inRange.size == 0) return []
	const closestHexes = new Set()
	let closestDist = 1000
	for (const h of inRange) {
		const dist = ship.distanceHex(s, h.hex)
		g.dbg("dist", dist, "to", hexToShip.get(h).name)
		if (dist > closestDist) continue
		if (dist == closestDist)
			closestHexes.add(h)
		else {
			closestDist = dist
			closestHexes.clear()
			closestHexes.add(h)
		}
	}
	// Now we have one or more closest hexes. Add the enemy ships on
	// those hexes to a set (to avoid duplicates)
	const targets = new Set()
	for (const h of closestHexes) {
		const ts = hexToShip.get(h)
		if (ship.nat(s) != ship.nat(ts) && !ts.surrendered) targets.add(ts)
	}
	// We want an array to easily switch between targets
	return Array.from(targets.values())
}

// Find the closest enemy target on port&starboard side, and mark one
function combatShipClick(s) {
	removeCollisionMarkers()
	unmarkFof()
	if (me && me != ship.nat(s)) return
	if (s.surrendered) return
	if (!s.targets) {
		s.targets = {}
		if (s.ammo.l) s.targets.l = findTargets(s, s.fof.l)
		if (s.ammo.r) s.targets.r = findTargets(s, s.fof.r)
	}
	if (!s.targets.l && !s.targets.r) return // no targets
	s.targetIndex = 100
	keySpace()
}
const targetMarkerTemplate = new Konva.Group()
targetMarkerTemplate.add(new Konva.Circle({
	radius: 24,
    stroke: 'red',
	strokeWidth: 3,
}))
targetMarkerTemplate.add(new Konva.Path({
    stroke: 'red',
	strokeWidth: 2,
	data: "M 0 -20 l 0 10 m 0 20 l 0 10 M -20 0 l 10 0 m 20 0 l 10 0",
}))
let targetMarker
function targetShip(s) {
	if (targetMarker) targetMarker.delete()
	targetMarker = targetMarkerTemplate.clone({
		offsetY: -30, 
	})
	targetMarker.rotation(s.d * 60)
	const pos = grid.hexToPixel(s.hex)
	targetMarker.position(pos)
	board.add(targetMarker)
}
function untargetShip() {
	if (targetMarker) {
		targetMarker.destroy()
		targetMarker = null
	}
}
export function fire(s, aim) {
	if (!s.target) return
	const t = s.target
	if (aim == 'h') {
		// rule 11.2.5
		const dist = ship.distance(s, t.s)
		if (dist > 5) {
			alert("Distance > 5, must aim at rigging")
			return
		}
	}
	untargetShip()
	s.target = null
	s.targets[t.b] = []
	s.ammo[t.b] = ''
	soundGun.currentTime = 0
	soundGun.play()
	resolveFire(s, t.b, t.s, aim)
}
function resolveFire(s, b, t, aim) {
	const a = aim == 'h' ? "hull" : "rigging"
	const dist = ship.distance(s, t)
	let guns = s.s.guns[b]
	if (dist <= 3 && s.s.car) guns += s.s.car[b]
	const hdt = tables.getHdt(guns)
	let ht = hdt.range[6]
	if (dist < 7) ht = hdt.range[dist - 1]
	// Modifiers, 11.3
	// Crew quality, 11.3.1
	ht += hdt.cq[s.cq]
	// Initial broadside, 11.3.4
	if (!s.hasFired) {
		ht += hdt.initialBr
		s.hasFired = true
	}
	// Crew section loss, 11.3.3
	for (let c of s.s.crew) if (c == 0) ht--
	// Rake, 11.3.2
	let side = map.side(t, s.hex)
	if (side != 'b' && side != 's') {
		// the bow is not in rake position, try the stern
		const st = ship.stern(s)
		side = map.side(t, st)
	}
	if ((side == 's' || side == 'b') && dist <= 5) ht += hdt.rake
	// Get damage
	let damage = '0'
	let d6 = 0
	if (ht >= 0) {
		if (ht > 8) ht = 8			// (basic rules)
		d6 = die.roll()
		damage = tables.hitTables[ht][a][d6-1]
	}
	if (true) {
		console.log(
			"Fire:", s.name, "->", t.name, "at", a, "guns",guns,
			"dist",dist, "ht",ht, "die",d6, "damage",damage, "side",side)
	}
	const dinfo = (damage == '0') ? "Miss" : damage
	const dtext = new Konva.Text({
		fontFamily: "sans-serif",
		fontSize: 20,
		fontStyle: "bold",
		text: dinfo,
		fill: 'red',
		offsetY: 30,
	})
	const pos = grid.hexToPixel(t.hex)
	dtext.position(pos)
	board.add(dtext)
	const dtween = new Konva.Tween({
		node: dtext,
		opacity: 0.4,
		duration: 1.0,
		easing: Konva.Easings.EaseInOut,
		onFinish: function() {
			dtext.destroy()
			dtween.destroy()
		},
	})
	dtween.play()
	// Damage is applied at end of combat phase
	t.dmg.push({s:s, dmg:damage})
}
function applyDamage() {
	function hitLR(n, g, side) {
		g[side] -= n
		if (g[side] < 0) {
			n = -g[side]
			g[side] = 0
			return n
		}
		return 0
	}
	function hitArray(n, a) {
		for (let i = 0; i < a.length; i++) {
			a[i] -= n
			if (a[i] < 0) {
				n = -a[i]
				a[i] = 0
			} else
				break
		}
	}
	for (const s of ships) {
		if (s.dmg.length == 0) continue
		for (const drec of s.dmg) {
			const dmg = drec.dmg
			if (dmg == "0") continue // miss
			for (const l of dmg.split('-')) {
				let n = 1, t = l
				if ("23456789".includes(l.charAt(0))) {
					n = Number(l.charAt(0))
					t = l.charAt(1)
				}
				switch (t) {
				case 'H':
					s.s.hull -= n
					if (s.s.hull < 0) s.s.hull = 0
					break
				case 'G':
					// Get the side. We must check rake for both bow and stern
					let side = map.side(s, drec.s.hex)
					if (side != 'b' || side != 's') {
						const st = ship.stern(drec.s)
						side = map.side(s, st)
					}
					if (side == 'b' || side == 's')
						side = die.roll() > 3 ? 'l' : 'r'
					// Carronades first (original basic rules)
					if (s.s.car) n = hitLR(n, s.s.car, side)
					n = hitLR(n, s.s.guns, side)
					if (n > 0) {
						s.s.hull -= n
						if (s.s.hull < 0) s.s.hull = 0
					}
					break
				case 'C':
					hitArray(n, s.s.crew)
					break
				case 'R':
					if (s.fullSails)
						hitArray(n*2, s.s.rigg)
					else
						hitArray(n, s.s.rigg)
					// Fullsails not allowed with a lost rigging section
					if (s.s.rigg[0] == 0) ship.fullSails(s, false)
					break
				}
			}
		}
		ship.checkSurrender(s)
	}
}
// ----------------------------------------------------------------------
// Main

;(async () => {
	// Load scenario (do this early)
	let scName = "trafalgar"
	const href = new URL(location.href)
	let param = href.searchParams.get("sc")
	if (param) scName = param
	scenario.init()
	sc = scenario.get(scName)
	if (!sc) {
		alert(`Scenario not found: ${scName}`)
		return
	}
	g.wind = sc.wind
	g.wind.d--			// internal representation 0-5
	if (g.wind.d < 0) g.wind.d = die.roll() - 1
	// Boxes 
	createInfoBox()
	updateInfoBox()
	// Map
	await map.init(sc.map)
	map.updateWindIndicator(info)
	// Add ships
	ships = sc.ships
	await ship.init(ships)
	for (const s of ships) {
		if (s.ih && !s.ih.t) ship.place(s, s.ih)
		s.img.on('click', shipOnClick)
	}
	// Play against AI? Check after 'ships' is initiated.
	// If 'player' is unspecified or doesn't exist, check the ship
	// array, and resort to the nat() of the first ship
	param = href.searchParams.get("ai")
	if (param) {
		const aiName = param
		param = href.searchParams.get("player")
		if (param) {
			if (sc.players && (param in sc.players))
				me = param
			else {
				me = ship.nat(ships[0]) // (default)
				for (const s of ships) {
					if (ship.nat(s) == param) {
						me = param
						break
					}
				}
			}
		} else {
			me = ship.nat(ships[0])
		}
		ai.set(aiName)			// After 'me' is defined
	}
	// Sounds
	// Crome recognises only "audio/mpeg"
	soundCrash = new Audio()
	soundCrash.src =
		crashAudioData.replace("application/octet-stream", "audio/mpeg")
	await new Promise((resolve, reject) => {
		soundCrash.addEventListener("canplaythrough", (event) => {
			resolve()
		})
	})
	soundGun = new Audio()
	soundGun.src =
		gunAudioData.replace("application/octet-stream", "audio/mpeg")
	await new Promise((resolve, reject) => {
		soundGun.addEventListener("canplaythrough", (event) => {
			resolve()
		})
	})

	// Start game
	sequence.nextStep()
})()
