import { getRandom } from "./RNG.js";
import config from "../../configuration/config.js";
import { KnightDao } from "../dao/knightDao.js";

const ROWS = config.game.grid.ROWS;
const COLUMNS = config.game.grid.COLUMNS;

export function shuffleGrid(grid) {
  const flatArray = grid.flat();

  for (let i = 0; i < ROWS * COLUMNS; i++) {
    const j = getRandom(0,ROWS * COLUMNS-1);

    if(!(flatArray[i] instanceof KnightDao || flatArray[j] instanceof KnightDao))
      [flatArray[i], flatArray[j]] = [flatArray[j], flatArray[i]];
  }

  grid = [];
  for (let i = 0; i < ROWS * COLUMNS; i += ROWS) {
    grid.push(flatArray.slice(i, i + ROWS));
  }

  return grid;
}
