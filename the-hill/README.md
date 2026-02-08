# The battle for The Hill

This is a complete game example for the [hex-games](
https://github.com/uablrek/hex-games) project.

The battle takes place at April 6 1806 at 10am, and is between French and
English troops. The French must secure "The Hill" within 2 hours
game-time (8 turns).

By default the English are pre-deployed and stands passive. Only the
French player takes turns. This can be changed with the `passiveBrits`
variable. Since time is a factor, this is not as easy as it seems. Bad
tactics, or bad luck will result in an English victory.

## Rules

* English deploys first anywhere west of "The River" (unless passive)
* French deploys anywhere east/south of the dotted line, but not in
  "The Forrest" or in "The Mountain"
* Stacking limit is 2
* To leave the river cost 2mp
* To move upslope cost 3mp
* All units have a Zone of Control (ZOC) in the 6 hexes around it
* To move in ZOC cost an additional 3mp
* ZOC does not extend into forrest or mountain
* There is no advance after combat

## Combat EX result

The player with most factors (usually the attacker) may be asked to
remove a number of factors. *This is shown in the info-box*. The units
that can be removed have a red mark. Click on a unit to remove it.
