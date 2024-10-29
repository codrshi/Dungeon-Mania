/*
 * indexController.js 
 *
 * This file encompasses the code responsible for delivering essential information upon the rendering of the homepage.
 * Currently, it provides the player's username and high score.
 */

import sillyname from "sillyname";
import stats_config from "../../configuration/stats_config.js";

stats_config.basicStats.username = sillyname();

export function getusernameAndHighScore() {

    return {
        username: stats_config.basicStats.username,
        highScore: stats_config.basicStats.highScore
    }
};
