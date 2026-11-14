// SPDX-License-Identifier: CC0-1.0.
/*
  This is a test program for for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import Konva from 'konva'
import {ui, grid} from '@uablrek/hex-games'

const width = 1000
const height = 800
const offset = {x:-40, y:-40}
const rpos = {x:-offset.x, y:-offset.y}

;(async () => {
	ui.init()
	grid.configure(50.5, 1.0, offset, false)
	const pattern = new Image()
	pattern.src = grid.patternSvg()
	await new Promise(resolve => pattern.onload = resolve)
	const hexGrid = new Konva.Rect({
		position: rpos,
		width: width,
		height: height,
		stroke: 'black',
		fillPatternImage: pattern,
		fillPatternRepeat: 'repeat',
		fillPatternScale: grid.patternScale(),
	})
	ui.board.add(hexGrid)
	// One-hex mask
	ui.board.add(grid.hmask.clone({
		fill: '#aaa',
		//stroke: 'red',
		position: grid.hexToPixel({x:1, y:1}),
	}))
	// Area-mask with clip to the grid rectangle
	const clipGroup = new Konva.Group({
		clip: {
			x: hexGrid.x(),
			y: hexGrid.y(),
			width: hexGrid.width(),
			height: hexGrid.height(),
		},
	})
	const center = grid.hexToAxial({x:10, y:16})
	for (const ax of grid.inRangeAxial(4, center)) {
		const pos = grid.hexToPixel(grid.axialToHex(ax))
		clipGroup.add(grid.hmask.clone({
			fill: '#bbb',
			opacity: 0.5,
			position: pos,
		}))
	}
	clipGroup.add(grid.hmask.clone({
		fill: '#aaa',
		position: grid.hexToPixel({x:0, y:0}),
	}))

	ui.board.add(clipGroup)
})()
