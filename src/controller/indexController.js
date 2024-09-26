import sillyname from "sillyname";
import stats_config from "../../configuration/stats_config.js";

stats_config.basicStats.username = sillyname();

export const resData = {
    username: stats_config.basicStats.username,
    highScore: stats_config.basicStats.highScore,
};
