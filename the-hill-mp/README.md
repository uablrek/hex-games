# The battle for The Hill

This is the Multi Player (mp) version of the game [Battle for The Hill](
https://github.com/uablrek/hex-games/tree/main/the-hill).

The rules are the same, but the start is different:

1. Start the server
2. Open the server url in a browser, usually http://localhost:8081/
3. Open the server url again in another browser/tab/window

When connections are established, the English player starts with
initial deployment.

Start the server:
```
eval $(admin env | grep HEX_GAMES_WORKSPACE)
serverd=$HEX_GAMES_WORKSPACE/server
admin build --open=no ./the-hill-mp # Build the client
admin run --appd=$serverd ./the-hill-mp/server/
# Open http://localhost:8081/ with your browswe twice
```
Or start the server in a docker container:
```
eval $(admin env | grep HEX_GAMES_WORKSPACE)
admin build --open=no ./the-hill-mp # Build the client
serverd=$HEX_GAMES_WORKSPACE/server
admin docker-build --appd=$serverd --tag=the-hill:latest ./the-hill-mp/server/
admin docker-run --tag=the-hill:latest
```



