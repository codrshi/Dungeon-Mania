import express from "express";
import config from "../../configuration/config.js";

const router = express.Router();

router.get(config.app.url.GUIDE, (req, res) => {
    res.render('guide');
});

export default router;