import express from "express";
import { clearEphConfig, setInit } from "../controller/e2eGamePhaseController.js";
import { rollDiceExecute, processMove } from "../controller/midGamePhaseController.js";
import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";
import stats_config from "../../configuration/stats_config.js";
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