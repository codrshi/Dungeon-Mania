import express from "express";
import { clearEphConfig, setInit } from "../controller/e2eGamePhaseController.js";
import { rollDiceExecute,processMove } from "../controller/midGamePhaseController.js";
import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";
import stats_config from "../../configuration/stats_config.js";

const router = express.Router();

router.get(config.app.url.ONGOING_GAME,(req,res) => {
    res.render('game',setInit(req.query.survivalMode));
});

router.get(config.app.url.ONGOING_GAME_EPH_CONFIG,(req,res) => {
    res.json({
        username: stats_config.basicStats.username,
        eph_config: eph_config
    });
});

router.get(config.app.url.ONGOING_GAME_ROLL_DICE,(req,res) => {
    res.json(rollDiceExecute());
});

router.post(config.app.url.ONGOING_GAME_PROCESS_MOVE,(req,res) => {
    res.json(processMove(req.body.newKnightCoordinate,req.body.diceNumber));
});

router.post(config.app.url.ONGOING_GAME_EXIT,(req,res) => {
    clearEphConfig();
    res.sendStatus(200);
});

export default router;