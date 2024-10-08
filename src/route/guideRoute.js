import express from "express";
import config from "../../configuration/config.js";
import { logger } from "../utility/loggerService.js";
import RenderPageException from "../exception/renderPageException.js";

const router = express.Router();

router.get(config.app.url.GUIDE, (req, res) => {
    logger(config.app.loggingLevel.INFO, "redering guide page...");

    try {
        res.render('guide', (err, html) => {
            if (err) {
                throw new RenderPageException("guide", err.message);
            }
            res.send(html);
        });
    }
    catch (err) {
        next(err);
    }
});

export default router;