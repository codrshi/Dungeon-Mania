/* scoreUpdater.js
 *
 * This utility file updates the score by a given value.
 */

import eph_config from "../configuration/ephemeral_config.js";
import config from "../configuration/config.js";
import { logger } from "../utility/loggerService.js";

const loggingLevel = config.app.loggingLevel;

export function updateScore(value) {
    const tempVar = eph_config.score;

    if (eph_config.knightHealth === 0)
        return;
    if (eph_config.activeEnema != null) {
        value += Math.ceil(value * eph_config.activeEnema.getBuff() / 100);
    }
    eph_config.score += value;

    logger(loggingLevel.INFO, "score updated:\nprevious value = {0}, new value = {1}, difference = {2}.", tempVar, eph_config.score, value);
}