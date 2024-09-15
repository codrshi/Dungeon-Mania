import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";
import { updateStats } from "./statsUpdateUtility.js";

export function terminateGame(gameStatus){
    if(eph_config.currentGameStatus !== config.game.gameStatus.ONGOING)
        return;
    eph_config.currentGameStatus = gameStatus;
    updateStats(gameStatus);
}
