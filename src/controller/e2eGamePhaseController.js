/*
 * e2eGamePhaseController.js 
 *
 * This file contains the code responsible for initializing the game at its onset and concluding it at its end.
 *
 * Game Initialization: Sets up the grid with new cards.
 * Game Conclusion: Clears the grid and resets both temp_stats_config and ephemeral_config.
 */

import config from "../configuration/config.js";
import eph_config from "../configuration/ephemeral_config.js";
import stats_config from "../configuration/stats_config.js";
import temp_stats_config from "../configuration/temp_stats_config.js";
import { getGrid, initializeGrid, setGrid } from "../utility/gridAccessor.js";
import { mapGrid } from "../utility/gridToImageMapper.js";
import { logger } from "../utility/loggerService.js";

const loggingLevel = config.app.loggingLevel;

// === Game Initialization Section ===
export function setInit(isSurvivalMode) {
    logger(loggingLevel.INFO, "setting up the game.");

    // Always reset state on a fresh /game request. Hitting this route
    // means "start a new game", and there is no resume-on-refresh
    // feature (beforeunload already kills the game on every navigation).
    //
    // The previous "if status !== ONGOING" guard only reset when the
    // server still believed a game was in progress -- which is exactly
    // the state during a mid-game Replay/F5 race against the async
    // sendBeacon('/game/exit'). When GET /game won that race, setInit
    // rendered the *old* grid while the exit beacon was still in
    // flight, then the beacon landed and wiped the grid -- leaving the
    // browser displaying cards the server had no backing data for, so
    // every subsequent /game/roll-dice 500'd silently and the player
    // was stranded on a frozen, faded board.
    logger(loggingLevel.INFO, "previous game status = {0}, clearing state for the new game.", eph_config.currentGameStatus);
    clearEphConfig();

    eph_config.isSurvivalMode = isSurvivalMode === "true";
    logger(loggingLevel.DEBUG, "isSurvivalMode = {0}", eph_config.isSurvivalMode);

    if (isSurvivalMode !== "true" && isSurvivalMode !== "false") {
        logger(loggingLevel.WARN, "isSurvivalMode is having an undefined value. So game will proceed in a non-survival mode.");
    }

    if (getGrid().length == 0) initializeGrid();

    const initResData = {
        username: stats_config.basicStats.username,
        grid: mapGrid(getGrid()),
    };
    return initResData;
}

// === Game Conclusion Section ===
export function clearEphConfig() {
    logger(loggingLevel.INFO, "clearing ephemeral configurations.");

    restoreDefaultEphConfig();
    setGrid([]);
    clearTempStatsConfig();
}

function restoreDefaultEphConfig() {
    eph_config.knightHealth = config.game.health.MAX_HEALTH;
    eph_config.knightWeapon = null;
    eph_config.score = 0;
    eph_config.newGrid = [];
    eph_config.newCardLocations = [];
    eph_config.activePoisons = [];
    eph_config.activeEnigma = null;
    eph_config.aura = 0;
    eph_config.isAuraThresholdThreeCrossed = false;
    eph_config.escapeDoorCountdown = 0;
    eph_config.currentGameStatus = config.game.gameStatus.ONGOING;
    eph_config.coordinate.x = 0;
    eph_config.coordinate.y = 0;
    eph_config.mageCoordinate.x = 2;
    eph_config.mageCoordinate.y = 2;
    eph_config.audioList = [];
    eph_config.screenLogs = ["Click the dice to begin."];
    eph_config.lastValidPositions = [];
    eph_config.lastDiceNumber = null;
}

function clearTempStatsConfig() {
    logger(loggingLevel.DEBUG, "clearing temp stats configurations.");

    temp_stats_config.basicStats.totalGamesMoves = 0;

    temp_stats_config.monsterStats.totalMonstersKilled = 0;
    temp_stats_config.monsterStats.elementalMonstersKilled = 0;
    temp_stats_config.monsterStats.monsterKillingStreakMoves = 0;
    temp_stats_config.monsterStats.strongestMonsterKilledHealth = "-";
    temp_stats_config.monsterStats.strongestMonsterKilledName = "-";

    temp_stats_config.weaponStats.totalweaponsGrabbed = 0;
    temp_stats_config.weaponStats.strongestWeaponName = "-";
    temp_stats_config.weaponStats.strongestWeaponAttribute = "-";
    temp_stats_config.weaponStats.weaponUsage = new Array(4).fill(0);

    temp_stats_config.artifactStats.totalArtifactsPicked = 0;
    temp_stats_config.artifactStats.artifactUsage = new Array(9).fill(0);
}