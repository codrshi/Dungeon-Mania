/*
 * indexController.js 
 *
 * This file encompasses the code responsible for delivering essential information upon the rendering of the homepage.
 * Currently, it provides the player's username and high score.
 */

import sillyname from "sillyname";
import stats_config from "../configuration/stats_config.js";
import { saveStats } from "../utility/statsPersistence.js";

export function ensureUsername() {
    if (!stats_config.basicStats.username) {
        stats_config.basicStats.username = sillyname();
        saveStats();
    }
}

export function getusernameAndHighScore() {

    return {
        username: stats_config.basicStats.username,
        highScore: stats_config.basicStats.highScore
    }
};
