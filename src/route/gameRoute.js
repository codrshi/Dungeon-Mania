/*
 * gameRoute.js
 *
 * Route Definition: Game Functionality
 *
 * Description:
 * - This route file handles requests related to an active game session, facilitating both data retrieval and page rendering.
 * - It integrates various game functionalities, such as initializing game settings, rolling dice, processing moves, and clearing ephemeral configurations.
 *
 * Route Logic:
 * 1. Ongoing Game Page Route (GET `config.app.url.ONGOING_GAME`):
 *    - Renders the game page ('game') while setting initial game state based on survival mode.
 *    - Logs an informational message before rendering the page.
 *    - If an error occurs during rendering, a `RenderPageException` is thrown with the page name ('game') and the error message.
 *    - Caught errors are passed to the next middleware function for centralized error handling.
 *
 * 2. Ongoing Game Ephemeral Config Route (GET `config.app.url.ONGOING_GAME_EPH_CONFIG`):
 *    - Returns JSON data containing the username and current ephemeral configuration.
 *
 * 3. Ongoing Game Roll Dice Route (GET `config.app.url.ONGOING_GAME_ROLL_DICE`):
 *    - Executes the dice roll logic and returns the result as JSON.
 *
 * 4. Ongoing Game Process Move Route (POST `config.app.url.ONGOING_GAME_PROCESS_MOVE`):
 *    - Processes a player's move based on the new knight coordinates and the rolled dice number.
 *    - If an error occurs, the current game status is set to "CRASHED", and the error is passed to the next middleware function.
 *
 * 5. Ongoing Game Exit Route (POST `config.app.url.ONGOING_GAME_EXIT`):
 *    - Logs an informational message when the player exits the current game.
 *    - Clears the ephemeral configuration and responds with a 200 status.
 *
 * Route Paths:
 * - GET `config.app.url.ONGOING_GAME`: Render and serve the ongoing game page.
 * - GET `config.app.url.ONGOING_GAME_EPH_CONFIG`: Serve player username and ephemeral configuration in JSON format.
 * - GET `config.app.url.ONGOING_GAME_ROLL_DICE`: Execute dice roll logic and return the result in JSON format.
 * - POST `config.app.url.ONGOING_GAME_PROCESS_MOVE`: Process the player's move and return the result in JSON format.
 * - POST `config.app.url.ONGOING_GAME_EXIT`: Handle player exit, clearing configurations and returning a success status.
 */

import express from "express";
import { clearEphConfig, setInit } from "../controller/e2eGamePhaseController.js";
import { rollDiceExecute, processMove } from "../controller/midGamePhaseController.js";
import config from "../configuration/config.js";
import eph_config from "../configuration/ephemeral_config.js";
import stats_config from "../configuration/stats_config.js";
import RenderPageException from "../exception/renderPageException.js";
import { logger } from "../utility/loggerService.js";

const router = express.Router();
const loggingLevel = config.app.loggingLevel;

router.get(config.app.url.ONGOING_GAME, (req, res, next) => {
    logger(loggingLevel.INFO, "redering game page...");

    try {
        res.render('game', setInit(req.query.survivalMode), (err, html) => {
            if (err) {
                throw new RenderPageException("game", err.message);
            }
            res.send(html);
        });
    }
    catch (err) {
        next(err);
    }
});

router.get(config.app.url.ONGOING_GAME_EPH_CONFIG, (req, res) => {
    res.json({
        username: stats_config.basicStats.username,
        eph_config: eph_config
    });
});

router.get(config.app.url.ONGOING_GAME_ROLL_DICE, (req, res) => {
    res.json(rollDiceExecute());
});

router.post(config.app.url.ONGOING_GAME_PROCESS_MOVE, (req, res, next) => {
    try {
        res.json(processMove(req.body.newKnightCoordinate, req.body.diceNumber));
    }
    catch (err) {
        eph_config.currentGameStatus = config.game.gameStatus.CRASHED;
        next(err);
    }
});

router.post(config.app.url.ONGOING_GAME_EXIT, (req, res) => {
    logger(loggingLevel.INFO, "exiting from current game...");

    clearEphConfig();
    res.sendStatus(200);
});

export default router;