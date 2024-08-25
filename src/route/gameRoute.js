import express from "express";
import { setInit,rollDiceExecute,processMove } from "../controller/gameController.js";
import config from "../../configuration/config.js";

const router = express.Router();

router.get(config.app.url.ONGOING_GAME,(req,res) => {
    console.log(req.query.survivalMode)
    res.render('game',setInit(req.query.survivalMode === 'true'));
});

router.get(config.app.url.ONGOING_GAME_ROLL_DICE,(req,res) => {
    res.json(rollDiceExecute());
});

router.post(config.app.url.ONGOING_GAME_PROCESS_MOVE,(req,res) => {
    res.json(processMove(req.body.newKnightCoordinate,req.body.diceNumber));
});

export default router;