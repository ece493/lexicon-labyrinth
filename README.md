Please view this document on github for the best experience.

# Setup/Deployment Instructions
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

# Test Guide
1. TO DO!

# User Guide
## IMPORTANT!
When testing this game with more than one player on a single machine, run it in two separate windows side by side. Running the game in multiple tabs in the same window or with overlapping windows has a small chance to cause unexpected behaviour. This is due to browser optimizations for unfocused tabs that mess with JS `setTimeout()` time accuracy.
Desired example setup below.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/4479dd7c-61ac-49a3-975c-0042898e12e7)


## Create a Lobby
1. Open the app by visiting `http://localhost:3000/` on a chrome or edge browser.
2. Click the start button to begin

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/0590cffd-d61c-4661-af28-b8eaad53314c)

3. Enter your nickname and click the start button
   
![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/721665e9-992d-4cef-9848-4c3510d6f966)

4. At this stage click the `new lobby` button
   
![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/edf92516-d8f6-44d2-8b6f-3c56567d4fd1)

5. Share the four digit lobby code on the top right with other players or click the copy button beside it to copy the lobby's url to your clipboard.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/7dc808e7-13cb-4686-a147-5d831fc812d1)

6. Adjust the turn timer, board size, and starting player lives using the sliders
   
![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/5e0feb00-9d1f-4a6f-adb4-580368ef5886)

7. Add a bot by clicking the `add bot` button

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/4e342eeb-c456-4918-91a5-b987f6e3d75c)

8. adjust bot settings by first clicking the bot player card

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/355c6a51-f092-42be-b02e-7e9230126d84)

9. Then edit difficulty by clicking the difficulty button to cycle through the difficulties

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/d3c1a623-d4b6-4f3e-8944-84e027a9c5a2)

10. You can also remove the bot by pushing the remove button

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/ed23d9d0-d896-451b-9b62-93109b6c8f3f)

11. Once all players have joined (following the steps outlined in `Join a Lobby by URL` or `Join a lobby by code`below), start the game by clicking the start button

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/925d755e-2fab-4449-86ca-ca32d3c86059)


## Join a Lobby by URL
1. get a url from a lobby host.
2. Enter the url into your chrome or edge browser
3. Click the start button to begin

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/0590cffd-d61c-4661-af28-b8eaad53314c)

4. Enter your nickname and click the start button
   
![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/721665e9-992d-4cef-9848-4c3510d6f966)

5. The lobby code should be auto filled for you. Click the start button

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/5c2136c5-70a5-4641-ba1e-17abfe61ea11)


## Join a Lobby by CODE
1. Open the app by visiting `http://localhost:3000/` on a chrome or edge browser.
2. Click the start button to begin

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/0590cffd-d61c-4661-af28-b8eaad53314c)

3. Enter your nickname and click the start button
   
![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/721665e9-992d-4cef-9848-4c3510d6f966)

4. Enter a lobby code from a lobby host. Click the start button

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/5c2136c5-70a5-4641-ba1e-17abfe61ea11)

## How To Play

### On your turn
On your turn the letter tiles will get brighter and you will be able to click them. Click on a tile and drag to form a word. Hit the `Submit` button to submit the word. Tiles used to form the word must be adjacent.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/e5a6a866-8715-4553-a7af-9ef3aa524b06)


The objective of the game is to find a word before the timer hits zero. If the timer does hit zero, you will lose a life. Once you loose all your lives, you are out of the game and can only spectate.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/fa9b914a-64d3-4965-8c81-e6320e6eb8eb)

You can view the amount of funds you will get for a certain word. Funds change based on word length and letter rarity. 

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/f456b47e-2335-42a1-9155-111f0916e1ce)


You can view the current turn order by looking at the player cards on the left. The top most player is the player who's turn it is. You can also view the funds and lives of other players.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/1fd75dbd-5966-4766-a6b8-220de29f1783)

Funds are used to purchase powerups in the left panel. Prices are listed beside each powerup. Click the button to activate a powerup. The panel also shows your current funds. You will not be able to purchase powerups if you do not have enough funds.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/9a20a4c7-d08a-4cec-80e6-1e19f2f20db4)

The rotate powerup allows you to rotate any single row or column any number of times. Clicking the rotate powerup button will open the rotate UI. Click the arrows to rotate any single row or column any number of times. Hit the confirm button to finalize the powerup.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/df83b6a9-acb1-430a-a7cc-0ea0cf22c435)

The transform powerup button allows you to transform any tile into any other letter tile. Clicking the transform powerup will open the transform UI. First select the tile to transform. Then select the tile to transform that tile into.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/2552c1c3-ac9d-4567-9e1f-a63d9ee12e62)

The scramble powerup will randomly generate a whole new board. Clicking the scramble powerup button will scramble the board without further menus.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/270e9a72-4402-41a5-a9bb-c883d98bcab5)

The swap powerup will allow you to swap any two tiles on the board. Clicking the swap powerup will open the swap UI. Select the first tile to swap. Then select the second tile to swap.

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/a74109c2-ef25-4519-b20a-4aff36b71ada)

## After the game
Click the continue button to return to the start screen

![image](https://github.com/ece493/lexicon-labyrinth/assets/74114171/fe16cabd-7651-43b6-87eb-e5915619619b)





