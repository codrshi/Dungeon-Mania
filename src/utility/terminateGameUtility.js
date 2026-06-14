/* terminateGameUtility.js
 *
 * This utility file terminates the game by changing gameStatus and calls the statsUpdateUtility.js
 */

import config from "../configuration/config.js";
import eph_config from "../configuration/ephemeral_config.js";
import { updateStats } from "./statsUpdateUtility.js";
import { logger } from "./loggerService.js";

const loggingLevel = config.app.loggingLevel;

export function terminateGame(gameStatus) {
    if (eph_config.currentGameStatus !== config.game.gameStatus.ONGOING) {
        logger(
            loggingLevel.DEBUG,
            "terminateGame ignored because game is already in status = {0}.",
            eph_config.currentGameStatus
        );
        return;
    }
    eph_config.currentGameStatus = gameStatus;
    updateStats(gameStatus);
    eph_config.audioList.push(gameStatus);

    logger(loggingLevel.INFO, "game terminated with status = {0}, final score = {1}.", gameStatus, eph_config.score);
}
