# Hex-games - Battle for Wesnoth maps

The [Battle for Wesnoth](https://www.wesnoth.org/) (BfW) is a very
good turn-base hex game. It's open source and you can get it from
[steam](https://store.steampowered.com/app/599390/Battle_for_Wesnoth/).
BfW comes with a great map editor! The exercise here is to use a BfW
map in our own game.

Export the BfW map as png. Here I use the most basic tutorial map:
```
cd /path/to/wesnoth/usr/local
wesnoth --screenshot \
  share/wesnoth/data/campaigns/tutorial/maps/02_Tutorial_part_2.map wn2.png
```
The map is exported without a grid, so we will add one as an exercise

### Battle for Wesnoth map License

The BfW [wiki](https://wiki.wesnoth.org/Wesnoth:Copyrights) explains
that all BfW content, including maps, are under [GNU GPL v2](
https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html) license. I
have added license metadata in [wn2.png](./figures/wn2.png) with
[exiftool](https://exiftool.org/):

```
> exiftool figures/wn2.png
...
Copyright                       : Authors of https://www.wesnoth.org/
Creator                         : https://github.com/wesnoth/wesnoth
Rights                          : GNU GPL v2+
Image Size                      : 2232x1548
```

### Add grid

The hexes are "flattop", and the map height is 21.5 hexes and 1548
pixels. This gives a `size` of 1548/21.5=72. The `scale` is
trickier. I am sure there is a way to compute it exactly, but I made
some tedious trial-and-error to find out. Here is a grid that seems to
fit:
```
hex emit_grid --flattop --rect 2200x1600 --size 72 --scale 0.865 > bfw-grid.svg
```

Now you can use the [grid module](lib/grid.js) to add a
grid. The offsets must also be tuned, and this time I think
trial-and-error is best.

The result is in [bfw-map/main.js](bfw-map/main.js). This is also an
example on how images can be loaded synchronously, one after the
other, using [await](
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await).
