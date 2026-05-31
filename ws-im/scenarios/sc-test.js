const scUser = `{
	"id": "test",
	"name": "The test Scenario",
    "description": "To test game play",
	"wind": {
		"d": 1,
		"v": 3,
		"change": 4
	},
	"classTable": "ah_napoleonic",
	"ships": [
		{"cid":"br-f3-36", "name": "Nymphe", "nat":"br", "cq": "Cr", "ih": {"hex":"Y18", "d":2, "fullSails": true}},
		{"cid":"fr-f3-36", "name": "Cleopatre", "nat":"fr", "hull":7, "cq": "Av", "crew":"2-2-2", "ih": {"hex":"FF16", "d":3}, "pv":"10"},
		{"cid":"us-f4-38", "name": "Congress", "nat":"us", "cq": "Cr", "ih": {"hex":"BB18", "d":1, "fullSails": true}},
		{"name": "Öland", "nat":"se", "ii":"sol", "class":"SOL2", "nguns":56, "hull":12, "crew":"4-3-3", "guns":8, "rigging":"6-6-6","cq": "Av", "ih": {"hex":"V20", "d":2}, "pv":15}
	],
	"map": {
		"focus": "BB17"
	}
}`

