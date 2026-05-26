# Wooden Ships & Iron Men

A browser version of the [Wooden Ships & Iron Men board game](
https://boardgamegeek.com/boardgame/237/wooden-ships-and-iron-men) (WS&IM).

This is a Work in Progress (WIP)

### Try it

* Download the `ws-im.zip` asset from the latest [release](
  https://github.com/uablrek/hex-games/releases)
* Unpack `ws-im.zip` (you **must** unpack, even on Windows)
* Open `index.html` in your browser

## Rules

Since the original rules are copyrighted and hard to come by, I use the
[Tournament Rules](https://boardgamegeek.com/filepage/224145/wsim-tournament-rules-30-june-2019-complete).

However, these rules are intended for experienced players, and the
"Beginners Rules" ("Basic Game Rules" in the original) are not
complete. For example combat charts are missing, and some sections are
doubled as in the "Advanced Rules". I intend to implement the Basic
rules first so I complement the rules when necessary with the ones in
the 1975 AH version (which I own).

## Scenarios

Scenarios are defined in separate [json](
https://en.wikipedia.org/wiki/JSON) files. Scenarios are included in
`bundle.js` (except the user defined scenario), so a rebuild is
required when adding or modifying scenarios. To define a scenario is
tedious and error prone, so contributions (issues or PRs) are
appreciated.

To understand how to define a scenario, please look at
[sc-trafalgar.json](./sc-trafalgar.json). The `id` must be unique, and
is used to identify the scenario when loading, example:
```
file:///tmp/ws-im/ws-im.html?sc=trafalgar
```
The ship classes are defined in [tables.js](./tables.js). The Spanish
`SOL2-64` has no pre-defined class, and must be fully defined.

### User defined scenario

To define a scenario replace the the `sc-user.js` file in the WS&IM
directory (where `index.html` is), and then select "User Defined",
or:
```
// (assuming WS&IM directory /tmp/ws-im)
cp sc-my-scenario.js /tmp/ws-im/sc-user.js
file:///tmp/ws-im/ws-im.html?sc=user
```

Please note that [sc-user.js](./sc-user.js) is a javascript file,
*not* JSON! The only difference though is that the json data is
enclosed in a javascript string. I recommend to edit the json data to
get aid from your editor, and add the javascript string when done.


## Development

For general development process and dependencies, please see [hex-games](
https://github.com/uablrek/hex-games/blob/main/HEXGAMES.md).

A full Ship definition may look like:
```js
const ship = {
	name: "Victory",
	nat: "br",
	class: "SOL1",
	nguns: 100,
	ii: "sol",           // image identifier
	img: {},             // generated
	i: 0,                // index in the ship array
	hull: 18,
	depth: 23,
	cq: "El",
	crew: "5-5-5",
	rigging: "8-8-8",
	guns: 11,
	car: 1,
	pv: 33,              // point value
	ih: {"hex":"HH19", "d":4}, // initial hex
	hex: {x:34, y:12},   // current position
	d: 4,                // current direction
	mov: {
		 turn: 1,
		 battle: {
			A: 3,
			B: 2,
			C: 1,
			D: 0,
		 },
		 full: {
			A: 5,
			B: 4,
			C: 2,
			D: 0,
		 },
	},
	s: {                  // Stats. These will be altered
		hull: 18,
		crew: [5,5,5],
		rigg: [8,8,8],
		guns: {l:11, r:11},
		car: {l:1, r:1},
	},
	m: "L11",             // movement notation
}
```
