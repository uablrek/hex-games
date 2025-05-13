# hex-games
Experiments with turn-based games on a hex grid

I want non-regular flat-top hexagons, so a single *size* parameter is
not sufficient. Instead the hexagons are defined by *(sx, sy, h)*:

<img src="figures/hex.svg" width="80%" />

For regular hexagons, set $h = sx/2$ and $sy = sx \sqrt 3 / 2$.

Now a hex path can be created as:

```javascript
function hex_path(sx, sy, h) {
	const d = 2 * (sx - h);
	return new Path2D(`m ${-sx} 0 l ${h} ${-sy} ${d} 0 ${h} ${sy} ${-h} ${sy} ${-d} 0 z`);
}
```
