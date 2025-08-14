# Dungeon Mania
Dungeon Mania is a dice-based card game in which player navigate their character card across a board, with movement determined by the dice roll. Player interacts with other cards on the board as they progress.
## How To Play
Upon rolling the dice, player may move in any of the four cardinal directions (east, west, north, south) by the dice number and interact with the card they land on. Depending upon the card type, player's health might increase or decrease. Once health reaches zero, the game terminates.

![game snapshot](./src/public/asset/image/game_snapshot.png)

## Languages Used
- **Frontend**: jQuery
- **Backend**: Express.js
- **Styling**: CSS
- **Templating**/**Rendering**: HTML, EJS

## Installation Guide

### Installation using Node.js
- Ensure you have Node.js installed on your system.
- Clone the repository:
  ```
  git clone https://github.com/codrshi/Dungeon-Mania.git
  ```
- Navigate to the `dungeon-mania` directory:
  ```
  cd dungeon-mania
  ```
- Install all Node dependencies:
  ```
  npm install
  ```
- Start the server:
  ```
  npm start
  ```
- The game should now be running at http://localhost:3030

### Installation using docker
- Ensure you have docker installed on your system.

- Pull the latest docker image:
  ```
  docker pull codrshi/dungeon-mania:latest
  ```

- Run the docker image:
  ```
  docker run -p 3030:3030 codrshi/dungeon-mania:latest
  ```

- The game should now be running at http://localhost:3030
