// SPDX-License-Identifier: CC-BY-4.0.
/*
  Handles terrain tiles for:
  https://github.com/uablrek/hex-games/tree/main/lgeneral
*/
import airfield_data from './airfield.png'
import airfield_rain_data from './airfield_rain.png'
import airfield_snow_data from './airfield_snow.png'
import clear_data from './clear.png'
import clear_rain_data from './clear_rain.png'
import clear_snow_data from './clear_snow.png'
import desert_data from './desert.png'
import desert_rain_data from './desert_rain.png'
import desert_snow_data from './desert_snow.png'
import fields_data from './fields.png'
import fields_rain_data from './fields_rain.png'
import fields_snow_data from './fields_snow.png'
import forest_data from './forest.png'
import forest_rain_data from './forest_rain.png'
import forest_snow_data from './forest_snow.png'
import fort_data from './fort.png'
import fort_rain_data from './fort_rain.png'
import fort_snow_data from './fort_snow.png'
import harbor_data from './harbor.png'
import harbor_rain_data from './harbor_rain.png'
import harbor_snow_data from './harbor_snow.png'
import mountain_data from './mountain.png'
import mountain_rain_data from './mountain_rain.png'
import mountain_snow_data from './mountain_snow.png'
import ocean_data from './ocean.png'
import ocean_rain_data from './ocean_rain.png'
import ocean_snow_data from './ocean_snow.png'
import river_data from './river.png'
import river_rain_data from './river_rain.png'
import river_snow_data from './river_snow.png'
import road_data from './road.png'
import road_rain_data from './road_rain.png'
import road_snow_data from './road_snow.png'
import rough_desert_data from './rough_desert.png'
import rough_desert_rain_data from './rough_desert_rain.png'
import rough_desert_snow_data from './rough_desert_snow.png'
import rough_data from './rough.png'
import rough_rain_data from './rough_rain.png'
import rough_snow_data from './rough_snow.png'
import swamp_data from './swamp.png'
import swamp_rain_data from './swamp_rain.png'
import swamp_snow_data from './swamp_snow.png'
import town_data from './town.png'
import town_rain_data from './town_rain.png'
import town_snow_data from './town_snow.png'

const dbg = console.log

export const tdata = new Map([
	["airfield", {data: airfield_data}],
	["airfield_rain", {data: airfield_rain_data}],
	["airfield_snow", {data: airfield_snow_data}],
	["clear", {data: clear_data}],
	["clear_rain", {data: clear_rain_data}],
	["clear_snow", {data: clear_snow_data}],
	["desert", {data: desert_data}],
	["desert_rain", {data: desert_rain_data}],
	["desert_snow", {data: desert_snow_data}],
	["fields", {data: fields_data}],
	["fields_rain", {data: fields_rain_data}],
	["fields_snow", {data: fields_snow_data}],
	["forest", {data: forest_data}],
	["forest_rain", {data: forest_rain_data}],
	["forest_snow", {data: forest_snow_data}],
	["fort", {data: fort_data}],
	["fort_rain", {data: fort_rain_data}],
	["fort_snow", {data: fort_snow_data}],
	["harbor", {data: harbor_data}],
	["harbor_rain", {data: harbor_rain_data}],
	["harbor_snow", {data: harbor_snow_data}],
	["mountain", {data: mountain_data}],
	["mountain_rain", {data: mountain_rain_data}],
	["mountain_snow", {data: mountain_snow_data}],
	["ocean", {data: ocean_data}],
	["ocean_rain", {data: ocean_rain_data}],
	["ocean_snow", {data: ocean_snow_data}],
	["river", {data: river_data}],
	["river_rain", {data: river_rain_data}],
	["river_snow", {data: river_snow_data}],
	["road", {data: road_data}],
	["road_rain", {data: road_rain_data}],
	["road_snow", {data: road_snow_data}],
	["rough_desert", {data: rough_desert_data}],
	["rough_desert_rain", {data: rough_desert_rain_data}],
	["rough_desert_snow", {data: rough_desert_snow_data}],
	["rough", {data: rough_data}],
	["rough_rain", {data: rough_rain_data}],
	["rough_snow", {data: rough_snow_data}],
	["swamp", {data: swamp_data}],
	["swamp_rain", {data: swamp_rain_data}],
	["swamp_snow", {data: swamp_snow_data}],
	["town", {data: town_data}],
	["town_rain", {data: town_rain_data}],
	["town_snow", {data: town_snow_data}],
])

export async function init() {
	let p = []
	for (const t of tdata.values()) {
		t.img = new Image()
		t.img.src = t.data
		p.push(new Promise(resolve => t.img.onload = resolve))
	}
	// Load image should never fail since data is local
	await Promise.all(p)

	// Create hex tiles
	for (const [k,t] of tdata.entries()) {
		const n = t.img.width / 60
		t.tile = new Array(n)
		for (let i = 0; i < n; i++) {
			t.tile[i] = new Konva.Image({
				crop: {
					x: i * 60,
					y: 0,
					width: 60,
					height: 50,
				},
				width: 60,
				image: t.img,
				offset: {
					x: 60 / 2,
					y: 50 / 2,
				},
			})
		}
	}
	return 0
}
