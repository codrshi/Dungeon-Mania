/* auraAppreciator.js 
 *
 * This utility file which manages the aura of the knight.
 *
 * It performs following task:
 * - increase or decrease aura by a certain value.
 * - terminate the game if aura reaches zero.
 * - responsible for initializing mage grid if aura reaches 1000
 */

import eph_config from "../configuration/ephemeral_config.js";
import config from "../configuration/config.js";
import { getGrid } from "./gridAccessor.js";
import { initializeMageGrid } from "./mageGridAccessor.js";
import { mapGrid } from "./gridToImageMapper.js";
import { terminateGame } from "./terminateGameUtility.js";
import { logger } from "../utility/loggerService.js";

const loggingLevel = config.app.loggingLevel;

export function appreciateAura(auraStatus, amount) {

    const tempVar = eph_config.aura;

    if (auraStatus === config.game.aura.DECREASE) {
        eph_config.aura -= Math.ceil(eph_config.aura * amount / 100);
        eph_config.aura = Math.max(0, eph_config.aura);

        logger(loggingLevel.INFO, "aura updated:\nprevious value = {0}, new value = {1}, difference = {2}.", tempVar, eph_config.aura, tempVar - eph_config.aura);

        if (eph_config.aura === 0) {
            terminateGame(config.game.gameStatus.LOST);
            eph_config.screenLogs.push("- aura exhausted.")
        }
        return;
    }

    if (eph_config.isAuraThresholdThreeCrossed)
        return;

    eph_config.aura += Math.ceil(Math.pow(Math.PI, Math.log10(amount)) + Math.sqrt(amount));
    eph_config.aura = Math.min(config.game.aura.AURA_THRESHOLD_3, eph_config.aura);

    logger(loggingLevel.INFO, "aura updated:\nprevious value = {0}, new value = {1}, difference = {2}.", tempVar, eph_config.aura, eph_config.aura - tempVar);

    if (eph_config.aura == config.game.aura.AURA_THRESHOLD_3 && eph_config.isSurvivalMode === false && eph_config.isAuraThresholdThreeCrossed === false) {
        eph_config.newCardLocations = [];
        initializeMageGrid();
        eph_config.newGrid = mapGrid(getGrid());
        eph_config.isAuraThresholdThreeCrossed = true;
        eph_config.audioList.push(config.game.id.monster.MAGE);
        eph_config.screenLogs.push("- aura maxed. Entered mage realm.");

        logger(loggingLevel.INFO, "aura maximum value of 1000 reached. Entering mage realm.");
    }

}