// SPDX-License-Identifier: CC0-1.0.
/*
  Units for turn-based games on hex grids.
  
  These are created as Korva.Group's, but may be converted to images
  to prevent frequent rendering.
 */
import Konva from 'konva'
import * as images from './unit-images.js'

// Path for half circle
// Source - https://stackoverflow.com/a/18473154
// Posted by opsb, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-26, License - CC BY-SA 3.0
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0
	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	}
}
function describeArc(x, y, radius, startAngle, endAngle){
	var start = polarToCartesian(x, y, radius, endAngle)
	var end = polarToCartesian(x, y, radius, startAngle)
	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
	var d = [
		"M", start.x, start.y,
		"A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
	].join(" ")
	return d	
}

let scale = 1
const side = 55
const unitBase = new Konva.Rect({
	height: side,
	width: side,
	cornerRadius: side*0.12,
})
const rx = side * 0.2
const ry = side * 0.18
const rw = side * 0.55
const rh = side * 0.35
const tx = side * 0.48
const ty = side * 0.58
const tz = side * 0.38
const lx = side * 0.78
const ly = side * 0.4
const lz = side * 0.18
const szx = side * 0.5
const szy = side * 0.0
const szz = side * 0.18

const pathNav = 'm 570.04688,237.1875 -10.53907,1.4082 -7.37109,4.41797 1.93945,15.24414 -23,2.67774 -4.8125,11.34179 -5.05664,3.82227 -6.52539,18.60742 -10.47656,7.39453 -11.8457,20.74024 -11.69727,-1.03125 -2.82422,-10.99024 h -50.25195 l -1.05469,3.44727 -36.47461,-12.89258 -3.54883,10.04102 36.90821,13.04492 -1.9629,6.41992 -7.45117,21.47266 -13.26953,-26.0254 h -45.72851 l -9.26172,5.34766 -0.61328,2.29297 -37.84571,-13.37695 -3.54882,10.04101 38.6289,13.65235 -1.8418,6.875 -168.08007,-3.04883 -10.51953,-6.97266 -15.04493,-1.5 -3.05078,-5.96875 H 123.6875 v 15.06836 l 36.76953,32.66797 h 701.43164 l 5.79492,-5.79492 v -14.89258 l -2.70507,-0.0488 -6.60157,-11.14648 -21.37304,0.43945 -5.07422,10.10742 -39.43164,-0.71484 -5.0625,-12.14063 h -25.03321 l -9.84961,-13.875 h -20.56054 l -6.62696,-11.10742 -8.91406,2.38867 -3.73633,7.57227 -3.32031,0.0352 -9.15234,-5.60352 v -32.77148 h -13.84766 l -11.73047,43.77929 h -19.98437 l 3.27539,-12.22656 7.27148,-7.26953 -13.67578,-15.37695 -22.10351,8.10156 -21.35743,24.01562 -10.01172,-2.68359 v -25.29297 h -16.67773 l -13.17578,-7.68945 V 260.6114 l 4.90234,-10.625 6.68946,-5.97656 z'
const pathSq = `M0,1h${rw}v${rh}h${-rw}v${-rh-1}`
const pathX = `M0,1l${rw},${rh}M0,${rh}l${rw},${-rh+2}`
const pathPz = `M${rw*0.3},${rh*0.3}` +
	  describeArc(side*0.18, side/5, 5, 180, 360) +
	  describeArc(side*0.38, side/5, 5, 0, 180) +
	  `h${-side*0.2-1}m0,10h${side*0.2+2}`
const pathCav = `M0,${rh+1}L${rw},1`
const pathAirRaw = describeArc(side*0.14, side/5, 3, 175, 365) +
	  describeArc(side*0.40, side/5, 3, 0, 185) +
	  `l${-side*0.26}},6m0,-6l${side*0.26},6`
const pathAir = `M${rw*0.3},${rh*0.3}` + pathAirRaw
const unitTypePath = {
	inf: pathSq + pathX,
	pz: pathSq + pathPz,
	mec: pathSq + pathX + pathPz,
	cav: pathSq + pathCav,
	air: pathSq + pathAir,
}
const hussarImg = new Image()

export function createUnit(color, stroke, type, stat, sz, lbl) {
	let u = new Konva.Group({
		offset: {x:side/2, y:side/2},
	})
	u.add(unitBase.clone({
		fill: color,
	}))
	let scl
	if (scale != 1) scl = {x:scale,y:scale}
	if (type == "gen") {
		if (images.loaded) {
			u.add(new Konva.Image({
				x: side*0.25,
				y: side*0.1,
				image: hussarImg,
				scale: {x:0.04,y:0.04}
			}))
		} else {
			u.add(new Konva.Path({
				data: pathSq,
				x: rx,
				y: ry,
				stroke: stroke,
			}))
		}
 		let txt = new Konva.Text({
			text: stat,
			x: tx,
			y: side*0.65,
			fontSize: side*0.25,
			fontStyle: 'bold',
			fill: stroke,
		})
		txt.offsetX(txt.width()/2)
		u.add(txt)
		if (lbl) {
 			let ltxt = new Konva.Text({
				text: lbl,
				fontSize: lz,
				fill: stroke,
			})
			// for long labels we must push this down
			ltxt.offsetX(ltxt.width()/2)
			ltxt.position({x:side*0.72,y:side*0.5})
			ltxt.rotate(-90)
			u.add(ltxt)
		}
		if (scl) u.scale(scl)
		return u
	}
	if (type == "nav") {
		const nscale = 0.06
		u.add(new Konva.Path({
			x: -2,
			y: 0,
			data: pathNav,
			fill: stroke,
			scale: {x:nscale,y:nscale}
		}))
 		let txt = new Konva.Text({
			text: stat,
			x: tx,
			y: side*0.47,
			fontSize: tz,
			fontStyle: 'bold',
			fill: stroke,
		})
		txt.offsetX(txt.width()/2)
		u.add(txt)
		if (scl) u.scale(scl)
		return u
	}
	if (type == "ab") {
		u.add(new Konva.Circle({
			stroke: stroke,
			radius: side*0.33,
			strokeWidth: 3,
			x: side/2,
			y: side/2,
		}))
		u.add(new Konva.Path({
			stroke: stroke,
			data: pathAirRaw,
			x: side*0.23,
			y: side*0.3,
		}))
		if (scl) u.scale(scl)
		return u
	}
	let upath = pathSq
	if (type in unitTypePath) upath = unitTypePath[type]
	u.add(new Konva.Path({
		data: upath,
		x: rx,
		y: ry,
		stroke: stroke,
	}))
	if (type == 'art') {
		// Can't create a filled circle with an svg path
		u.add(new Konva.Circle({
			fill: stroke,
			x: rx + rw/2,
			y: ry+1 + rh/2,
			radius: rh/4,
		}))
	}
 	let txt = new Konva.Text({
		text: stat,
		x: tx,
		y: ty,
		fontSize: tz,
		fontStyle: 'bold',
		fill: stroke,
	})
	txt.offsetX(txt.width()/2)
	u.add(txt)
	if (sz) {
 		let stxt = new Konva.Text({
			text: sz,
			fontSize: szz,
			fill: stroke,
		})
		stxt.offsetX(stxt.width()/2)
		stxt.position({x:szx,y:szy})
		u.add(stxt)		
	}
	if (lbl) {
 		let ltxt = new Konva.Text({
			text: lbl,
			fontSize: lz,
			fill: stroke,
		})
		// for long labels we must push this down
		if (ltxt.width() < rw)
			ltxt.offsetX(ltxt.width()/2)
		else
			ltxt.offsetX(ltxt.width() - rw/2)
		ltxt.position({x:lx,y:ly})
		ltxt.rotate(-90)
		u.add(ltxt)
	}
	if (scl) u.scale(scl)
	return u
}

export async function createUnitImage(color, stroke, type, stat, sz, lbl) {
	const img = await createUnit(color, stroke, type, stat, sz, lbl).toImage()
	let u = new Konva.Image({
		image: img,
		offset: {x:side/2*scale, y:side/2*scale},
	})
	return u
}

export async function init(_scale = 1.0) {
	scale = _scale
	if (images.loaded) {
		hussarImg.src = images.hussarData
		await new Promise(resolve => hussarImg.onload = resolve)
	}
}
