# The battle for The Hill

This is the Multi Player (mp) version of the game [Battle for The Hill](
https://github.com/uablrek/hex-games/tree/main/the-hill).

The rules are the same, but the start is different:

1. Start the server
2. Open the server url in a browser, usually http://localhost:8081/
3. Open the server url again in another browser/tab/window

When connections are established, the English player starts with
initial deployment.

TIP: Use "split view" to see both sides.

Start the server:
```
#eval $(./admin.sh alias)  # (assumed)
cd the-hill-mp
admin server-app .
# Open http://localhost:8081/ with your browswe twice
$BROWSER --new-window http://localhost:8081/
# Or start the server in a docker container:
admin docker-app .
admin docker-run --tag=the-hill-mp:latest
# Use the printed address. Example: http://172.17.0.2:8081/, or
# http://localhost:8081/ (port 8081 is exported)
```


