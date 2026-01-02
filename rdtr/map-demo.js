import Konva from 'konva';

const hsize = 58.7;				// --size to hex.py
const hscale = 0.988;			// --scale to hex.py
const rsize = hsize * hscale * Math.sqrt(3) / 2;  // row interval
const grid_offset = {x:57, y:23}  // 0,0 on the map image

// The functions below uses offset coordinates for "pointy" hexes, and
// are NOT perfect. A click near the top/bottom of a hex *may* select
// an adjacent hex. But for practical use, they are good enough for
// me. They take --scale into account.
function pixel_to_hex(pos) {
	// Adjust for grid/map offset
	pos = {x:pos.x + grid_offset.x, y:pos.y + grid_offset.y}
	y = Math.round(pos.y / rsize - 0.42) // 0.42 ~= 5/12
	if (y % 2 == 0) {
		x = Math.round(pos.x / hsize)
	} else {
		x = Math.round(pos.x / hsize - 0.5)
	}
	return({x:x, y:y});
}
function hex_to_pixel(pos) {
	y = Math.round(pos.y * rsize + rsize/3)
	if (pos.y % 2 == 0) {
		x = Math.round(pos.x * hsize)
	} else {
		x = Math.round(pos.x * hsize + (hsize/2))
	}
	// Adjust for grid/map offset
	return({x:x - grid_offset.x, y:y - grid_offset.y});
}
function toAxial(pos) {
	if (pos.y % 2 == 0) {
		q =  pos.x - pos.y / 2
	} else {
		q = pos.x - (pos.y - 1) / 2
	}
	return {q: q, r: pos.y}
}
function toRdtr(pos) {
	// pos is an Axial coordinate. RDTR uses letters A-KK for row, and
	// a positive int for q.
	if (pos.r < 27) {
		r = String.fromCharCode(pos.r + 64)
	} else {
		let c = pos.r + 38
		r = String.fromCharCode(c, c)
	}
	return {q: pos.q + 15, r: r}
}

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,
});

const board = new Konva.Layer({
	draggable: true,
});
stage.add(board);

const imageObj = new Image();
imageObj.src = './rdtr-map.png'
const map = new Konva.Image({
    image: imageObj,
});
board.add(map);

// Add a "marker" that can be moved to hexes
initMarker = {x:10,y:4}
cc = hex_to_pixel(initMarker)
marker = new Konva.Circle({
	x: cc.x,
	y: cc.y,
	radius: 15,
	fill: "red",
	stroke: 'black',
	stroke_width: 1
});
board.add(marker)

// Create an "info" layer that stays in place (on top, to the left)
// when the map is dragged.
const info = new Konva.Layer()
stage.add(info);
info.add(new Konva.Rect({
	x: 0,
	y: 0,
	width: 300,
	height: window.innerHeight,
	fill:"lightgray",
	opacity: 0.5,				// (this looks nice!)
}))

function textBox(config, label) {
	box = new Konva.Group(config)
	box.add(new Konva.Rect({
		x: box.x(),
		y: box.y(),
		width: box.width(),
		height: box.height(),
		fill: 'gray',
		cornerRadius: 20,
		stroke: 'gold',
		strokeWidth: 3,
	}))
	box.add(new Konva.Text({
		x: box.x() + 8,
		y: box.y() + 4,
		text: label,
		fontFamily: 'Calibri',
		fontSize: 18,
		fill: 'gold',
	}))
	box.add(new Konva.Text({
		x: box.x() + 8,
		y: box.y() + 30,
		fontFamily: 'Calibri',
		fontSize: 20,
		fill: 'white',
		name: 'txt',
	}))
	return box
}

infoBox = textBox({
	x: 10,
	y: 10,
	width: 240,
	height: 180
}, "Instructions")
infoBox.findOne('.txt').text(
	'Click on the map to\nmove the marker\n\nGrab and move\nthe entire map')
info.add(infoBox)

axialBox = textBox({
	x: 10,
	y: 110,
	width: 240,
	height: 70
}, "Axial coordinates")
axialText = axialBox.findOne('.txt')
info.add(axialBox)
axial = toAxial(initMarker)
axialText.text(`${axial.q}, ${axial.r}`)

rdtrBox = textBox({
	x: 10,
	y: 150,
	width: 240,
	height: 70
}, "RDTR coordinates")
rdtrText = rdtrBox.findOne('.txt')
info.add(rdtrBox)
rdtr = toRdtr(axial)
rdtrText.text(`${rdtr.r}, ${rdtr.q}`)

posBox = textBox({
	x: 10,
	y: 190,
	width: 240,
	height: 70
}, "Last click position")
clickText = posBox.findOne('.txt')
info.add(posBox)

map.on('click', function() {
	pos = map.getRelativePointerPosition();
	clickText.text(`${pos.x}, ${pos.y}`)
	h = pixel_to_hex(pos)
	axial = toAxial(h)
	axialText.text(`${axial.q}, ${axial.r}`)
	rdtr = toRdtr(axial)
	rdtrText.text(`${rdtr.r}, ${rdtr.q}`)
	ph = hex_to_pixel(h)
	marker.x(ph.x)
	marker.y(ph.y)
});
