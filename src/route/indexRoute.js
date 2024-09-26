import express from "express";
import { resData } from "../controller/indexController.js";
import config from "../../configuration/config.js";

const router = express.Router();

router.get(config.app.url.HOME_PAGE, (req, res) => {
    res.render('index');
})

router.get(config.app.url.HOME_PAGE_USERNAME_HIGHSCORE, (req, res) => {
    res.json(resData);
});

export default router;