import express from "express";
import { resData } from "../controller/indexController.js";
import config from "../../configuration/config.js";
import { logger } from "../utility/loggerService.js";
import RenderPageException from "../exception/renderPageException.js";

const router = express.Router();
const loggingLevel = config.app.loggingLevel;

router.get(config.app.url.HOME_PAGE, (req, res, next) => {
    logger(loggingLevel.INFO, "redering home page...");

    try {
        res.render('index', (err, html) => {
            if (err) {
                throw new RenderPageException("index", err.message);
            }
            res.send(html);
        });
    }
    catch (err) {
        next(err);
    }
});

router.get(config.app.url.HOME_PAGE_USERNAME_HIGHSCORE, (req, res) => {
    res.json(resData);
});

export default router;