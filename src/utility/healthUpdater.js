import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";
import { terminateGame } from "./terminateGameUtility.js";
let tempVar = 0;

export function updateHealth(healthStatus, amount) {

    tempVar = eph_config.knightHealth;

    if (healthStatus === config.game.health.INCREASE) {
        eph_config.knightHealth = Math.min(config.game.health.MAX_HEALTH, eph_config.knightHealth + amount);
        if (eph_config.knightHealth - tempVar != 0)
            eph_config.screenLogs.push("- gained " + (eph_config.knightHealth - tempVar) + " health.");
    }
    else if (healthStatus === config.game.health.DECREASE) {
        if (eph_config.activeEnema != null) {
            amount -= Math.ceil(amount * eph_config.activeEnema.getBuff() / 100);
        }
        eph_config.knightHealth = Math.max(0, eph_config.knightHealth - amount);

        if (eph_config.knightHealth == 0) {
            terminateGame(config.game.gameStatus.LOST);
            eph_config.screenLogs.push("- health exhausted.");
            return;
        }
        if (tempVar - eph_config.knightHealth != 0)
            eph_config.screenLogs.push("- lost " + (tempVar - eph_config.knightHealth) + " health.");
    }
}