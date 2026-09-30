# The battle for The Hill

This is the test game for the [hex-games](
https://github.com/uablrek/hex-games) project.

The battle takes place at April 6 1806 at 10am, and is between French and
English troops. The French must secure "The Hill" within 2 hours
game-time (8 turns).

The game can be played solitarie, Player v.s. player (PvP) or against
an AI. PvP requires a game server, and the AI can only play as English.

## Rules

* English deploys first anywhere west of "The River"
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
remove a number of factors. The units that can be removed have a red
mark. Click on a unit to remove it.

## Deployment validation

After initial deployment a validation is made. Any units that violates
the deployment rules are put back in the UnitBox, and you can place
them again.

## PvP

Start the server, then open the server address twice. The first to
connect becomes French.

TIP: Use "split view" to see both sides when testing

```
cd the-hill
admin server-app .
# Open http://localhost:8081/ with your browser twice
$BROWSER --new-window http://localhost:8081/
# Or start the server in a docker container:
admin docker-app .
admin docker-run --tag=the-hill:latest
# Use the printed address. Example: http://172.17.0.2:8081/, or
# http://localhost:8081/ (port 8081 is exported)
```
