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

## Stacks

There is a stacking limit of 2. A stack has a "shadow" to show that it
is more than une unit in the hex. Move the pointer over the stack and
hit `Space` to rotate it.

## Combat

On a "Combat" phase a [Combat Result Table](
https://en.wikipedia.org/wiki/Combat_results_table) (CRT) is shown.

1. Click on an enemy unit. A `target marker` will appear
2. Click on friendly units that will attack. Only adjacent units,
   or artillery 2 hexes away, may participate
3. Check the CRT for the odds
4. Hit `a` to attack

If you want to abort the attack, just click on another enemy.

### EX result

The player with most factors (usually the attacker) may be asked to
remove a number of factors. *This is shown in the info-box*. The units
that can be removed have a red mark. Click on a unit to remove it.

## Deployment validation

After initial deployment a validation is made. Any units that violates
the deployment rules are put back in the UnitBox, and you can place
them again.