import express from "express";
import { getStats } from "../controller/statsController.js";
import config from "../../configuration/config.js";

const router = express.Router();

router.get(config.app.url.STATS, (req, res) => {
    res.render('stats', getStats());
});

export default router;