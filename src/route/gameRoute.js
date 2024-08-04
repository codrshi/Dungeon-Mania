import express from "express";
import { setInit,rollDiceExecute,processMove } from "../controller/gameController.js";

const router = express.Router();

router.get('/game',(req,res) => {
    res.render('game',setInit());
});

router.get('/game/roll-dice',(req,res) => {
    res.json(rollDiceExecute());
});

router.post('/game/process-move',(req,res) => {
    res.json(processMove(req.body.newKnightCoordinate,req.body.diceNumber));
});

export default router;