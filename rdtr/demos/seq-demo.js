// SPDX-License-Identifier: CC0-1.0.
/*
  RDTR Sequence demo
  https://github.com/uablrek/hex-games/tree/main/rdtr

  RDTR has *a lot* of sequences!
*/
import Konva from 'konva';
import * as sequence from './sequence.js'
import * as box from './textbox.js'

let stage = new Konva.Stage({
	container: "container",
	width: window.innerWidth,
	height: window.innerHeight,
});
let board = new Konva.Layer({
	draggable: true,
});
stage.add(board)
const mapImg = new Image()
mapImg.src = './rdtr-map.png'
export const map = new Konva.Image({
    image: mapImg,
})
stage.container().tabIndex = 1
stage.container().focus()
stage.container().addEventListener("keydown", keydown)

function keydown(e) {
	if (e.key == 'n' || e.key == "Enter") {
		if (e.repeat) return
		sequence.nextStep()
		return
	}
}

// ----------------------------------------------------------------------
// Utils

const orderOfDeployment = ['po', 'it', 'fr', 'uk', 'su', 'ge']
const playerOrder = ['Axis', 'Allies', 'Soviet']
const nat = {
	po: "Poland",
	it: "Italy",
	fr: "France",
	uk: "UK",
	su: "Soviet Union",
	ge: "Germany",
}

function stepTurn() {
	switch (s.turn.season) {
	case "spring":
		s.turn.season = "summer"
		break
	case "summer":
		s.turn.season = "fall"
		break
	case "fall":
		s.turn.season = "winter"
		break
	case "winter":
		s.turn.season = "spring"
		s.turn.year++
		break
	}
}
// Current status
let s = {
	turn: {year:1939, season:"fall"},
	player: "",
	phase: "",
	front: "West",
	action: "",
	i: 0,
}


let theTraceBox
function traceOn(board) {
	if (theTraceBox) return
	theTraceBox = box.info({
		label: "Trace",
		x: 1100,
		width: 600,
		destroyable: false,
	})
	board.add(theTraceBox)
	sequence.traceOn(theTraceBox)
}

let theInfoBox = box.info({
	label: "Info",
	x: 1100,
	y: 400,
	width: 400,
	height: 400,
	destroyable: false,
})
function updateInfo() {
	let txt = "Hit 'Enter' or 'n' to  proceed\n\n"
	txt += `Turn: ${s.turn.year}, ${s.turn.season}\n`
	txt += `Player: ${s.player}\n`
	txt += `Phase: ${s.phase}\n`
	txt += `Front: ${s.front}, ${s.action}\n`
	box.update(theInfoBox, txt)
}
function updatePhase(seq) {
	s.phase = seq.currentStep.name
	updateInfo()
}
// ----------------------------------------------------------------------
// Sequences

sequence.add(new sequence.Sequence({
	name: "game",
	steps: [
		{
			name: "Required setup",
			start: sequence.proceed
		},
		{
			name: "Initial Deployment",
			start: (seq) => {
				s.phase = "Initial Deployment"
				sequence.jump(seq, "ideploy")
			}
		},
		{
			name: "Turn",
			start: (seq) => {
				sequence.jump(seq, "turn")
			}
		},
		{
			name: "Next Turn",
			start: (seq) => {
				console.log("In Next Turn...")
				stepTurn()
				//console.log(`Turn: ${s.turn.season} ${s.turn.year}`)
				if (s.turn.year == 1940 && s.turn.season == 'summer')
					seq.nextStep()
				else
					seq.gotoStep("Turn")
			}
		},
		{
			name: "End of Game",
			start: (seq) => {
				s.player = 'None'
				s.front = 'None'
				s.action = 'None'
				updatePhase(seq)
			}
		},
	],
}), true)


sequence.add(new sequence.Sequence({
	name: "turn",
	steps: [
		{
			name: "Check for YSS",
			start: (seq) => {
				updatePhase(seq)
				if (s.turn.season == "spring") {
					sequence.jump(seq, "yss")
					return
				}
				seq.nextStep()
			}
		},
		{
			name: "Determine order of play",
			start: (seq) => {
				s.i = 0
				seq.nextStep()
			}
		},
		{
			name: "Declaration of War (DoW)",
			start: (seq) => {
				s.player = "All"
				s.action = ''
				updatePhase(seq)
			}
		},
		{
			name: "Announce front action",
			start: (seq) => {
				s.player = "All"
				s.action = '?'
				updatePhase(seq)
			}
		},
		{
			name: "Player",
			start: (seq) => {
				s.player = playerOrder[s.i]
				switch (s.player) {
				case "Axis": s.action = "Offensive"; break
				case "Allies": s.action = "Attrition"; break
				case "Soviet": s.action = "Pass"; break
				}
				seq.nextStep()
			}
		},
		{
			name: "Movement",
			start: updatePhase
		},
		{
			name: "Action",
			start: (seq) => {
				switch (s.action) {
				case "Offensive":
					sequence.jump(seq, "offensive")
					break
				case "Attrition":
					sequence.jump(seq, "attrition")
					break
				case "Pass":
					seq.nextStep()
				}
			}
		},
		{
			name: "Unit Construction",
			start: updatePhase
		},
		{
			name: "Strategic Redeployment (SR)",
			start: updatePhase
		},
		{
			name: "Remove overstacked/unsupplied units",
			start: updatePhase
		},
		{
			name: "Next Player",
			start: (seq) => {
				s.i++
				if (s.i >= playerOrder.length) {
					sequence.back(seq, true)
					return
				}
				seq.gotoStep("Player")
			}
		},
	],
}))

sequence.add(new sequence.Sequence({
	name: "ideploy",
	steps: [
		{
			name: "Deploy",
			start: (seq) => {
				s.player = nat[orderOfDeployment[s.i]]
				updatePhase(seq)
			}
		},
		{
			name: "Next Deployer",
			start: (seq) => {
				s.i++
				if (s.i >= orderOfDeployment.length)
					sequence.back(seq)
				else
					seq.gotoStep("Deploy")
			}
		},
	]
}))

sequence.add(new sequence.Sequence({
	name: "yss",
	steps: [
		{
			name: "Year Start Sequence (YSS)",
			start: (seq) => {
				s.player = ''
				updatePhase(seq)
			}
		},
		{
			name: "SW resolution",
			start: updatePhase
		},
		{
			name: "BRP calculation",
			start: updatePhase
		},
		{
			name: "SW construction",
			start: updatePhase
		},
		{
			name: "Continue turn",
			start: sequence.back
		},
	]
}))

sequence.add(new sequence.Sequence({
	name: "offensive",
	steps: [
		{
			name: "Setup",
			start: sequence.proceed
		},
		{
			name: "Attacker naval+air",
			start: updatePhase
		},
		{
			name: "Defender inteception+DAS",
			start: updatePhase
		},
		{
			name: "Sea Transport Missions",
			start: updatePhase
		},
		{
			name: "Airborne drops",
			start: updatePhase
		},
		{
			name: "Combat",
			start: updatePhase
		},
		{
			name: "Exploitation",
			start: updatePhase
		},
		{
			name: "Continue turn",
			start: sequence.back
		},
	]
}))

sequence.add(new sequence.Sequence({
	name: "attrition",
	steps: [
		{
			name: "Attrition resolution",
			start: updatePhase
		},
		{
			name: "Continue turn",
			start: sequence.back
		},		
	]
}))

// ----------------------------------------------------------------------
// async main
;(async () => {
	await new Promise(resolve => mapImg.onload = resolve)
	board.add(map)
	sequence.nextStep()
	board.add(theInfoBox)
	traceOn(board)
})()
