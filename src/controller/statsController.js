import stats_config from "../../configuration/stats_config.js";

export function getStats() {
    const statsResData = {
        stats_config: stats_config,
    };
    return statsResData;
}
