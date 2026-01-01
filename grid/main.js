import Konva from 'konva';

// The grid is assumed to be created with "hex.py", so --size
// differs from "size" on https://www.redblobgames.com 
const hsize = 50;				// --size to hex.py
const hscale = 1.1;				// --scale to hex.py
const rsize = hsize * hscale * Math.sqrt(3) / 2;  // row interval

// The functions on https://www.redblobgames.com/ did not work
// out-of-the-box, and honestly I did not understand them, so I
// coudn't fix it. The functions below uses offset coordinates for
// "pointy" hexes, and are NOT perfect. A click near the top/bottom of
// a hex *may* select an adjacent hex. But for practical use, they are
// good enough for me. They aslo takes --scale into account.
function pixel_to_hex(pos) {
	y = Math.round(pos.y / rsize - 0.42) // 0.42 ~= 5/12
	if (y % 2 == 0) {
		x = Math.round(pos.x / hsize)
	} else {
		x = Math.round(pos.x / hsize - 0.5)
	}
	return({x:x, y:y});
}
function hex_to_pixel(pos) {
	// For "pointy" hex
	y = Math.round(pos.y * rsize + rsize/3)
	if (pos.y % 2 == 0) {
		x = Math.round(pos.x * hsize)
	} else {
		x = Math.round(pos.x * hsize + (hsize/2))
	}
	return({x:x, y:y});
}
function toAxial(pos) {
	if (pos.y % 2 == 0) {
		q =  pos.x - pos.y / 2
	} else {
		q = pos.x - (pos.y - 1) / 2
	}
	return {q: q, r: pos.y}
}

const stage = new Konva.Stage({
	container: 'container',
	width: window.innerWidth,
	height: window.innerHeight,
});

const map = new Konva.Layer({
	draggable: true,
});
stage.add(map);

const imageObj = new Image();
import gridData from './grid.svg'
imageObj.src = gridData;
const grid = new Konva.Image({
    image: imageObj,
});
map.add(grid);

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
map.add(marker)

// Create an "info" layer that stays in place (on top, to the left)
// when the map (grid) is dragged.
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
	'Click on the grid to\nmove the marker\n\nGrab and move\nthe entire grid')
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

posBox = textBox({
	x: 10,
	y: 160,
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
	ph = hex_to_pixel(h)
	marker.x(ph.x)
	marker.y(ph.y)
});

