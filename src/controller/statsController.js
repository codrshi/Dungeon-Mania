import stats_config from "../../configuration/stats_config.js";
import { logger } from "../utility/loggerService.js";
import config from "../../configuration/config.js";

export function getStats() {
    const statsResData = {
        stats_config: stats_config,
    };

    logger(config.app.loggingLevel.INFO, "loading player stats:\n{0}",JSON.stringify(stats_config,null, 2));
    return statsResData;
}
