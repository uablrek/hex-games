# The battle for The Hill

This is the Multi Player (mp) version of the game [Battle for The Hill](
https://github.com/uablrek/hex-games/tree/main/the-hill).

The rules are the same, but the start is different:

1. Start the server
2. Start the French player
3. Start the English player in another tab/window

Start the server, assuming a release is used:
```
cd the-hill-server
node bundle.cjs
```

Then open "index.html" in your browser and open The Hill - Multi
player two times in different tab/window's to test. If another player can
connect to the server, you can play PvP.

When connections are established, the English player starts with
initial deployment.

## Development run

```
eval $(admin env | grep HEX_GAMES_WORKSPACE)
serverd=$HEX_GAMES_WORKSPACE/server
admin run --appd=$serverd ./the-hill-mp/server/
# (in another shell)
admin build --open=no ./the-hill-mp # Build the client
admin open --keep index.html        # Start French player
admin open --keep index.html        # Start English player
```

