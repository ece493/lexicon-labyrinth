# Lexicon Labyrinth

## Setup/Deployment Instructions
1. Deployment has been automated using Docker! Ensure that you have Docker Compose or Docker Desktop installed. To learn how to do so, please visit: https://docs.docker.com/compose/install/
2. After installing Docker, from your cli run:
```
docker compose up
```
If you do not want the Docker container attached to your cli window, run:
```
docker compose up -d
```
3. All the required dependencies will be installed automatically.
4. Once the server and client setup process is complete, the game can be accessed at the url [http://localhost:3000/](http://localhost:3000/).

## To Start a Lobby
1. Open the app by visiting `http://localhost:3000/` on a chrome or edge browser.
2. Click the start button to begin
3. Enter your nickname and click the start button
4. At this stage click the `new lobby` button
5. Share the four digit lobby code on the top right with other players or click the copy button beside it to copy the lobby's url to your clipboard
