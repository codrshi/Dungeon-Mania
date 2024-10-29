/*
 * homeRoute.js
 *
 * Route Definition: Home Page and Data Endpoints
 *
 * Description:
 * - This route file handles requests for rendering the application's home page as well as serving player-specific data.
 *
 * Route Logic:
 * 1. Home Page Route (GET `config.app.url.HOME_PAGE`):
 *    - Renders the home page ('index') using `res.render()`.
 *    - Logs an informational message before rendering.
 *    - If an error occurs during rendering, a `RenderPageException` is thrown with the page name ('index') and the error message.
 *    - Caught errors are passed to the next middleware function for centralized error handling.
 *
 * 2. Player Data Endpoint (GET `config.app.url.HOME_PAGE_USERNAME_HIGHSCORE`):
 *    - Returns JSON data with the player's username and high score, retrieved by calling `getusernameAndHighScore()`.
 *
 * Route Paths:
 * - GET `config.app.url.HOME_PAGE`: Render and serve the home page.
 * - GET `config.app.url.HOME_PAGE_USERNAME_HIGHSCORE`: Serve player username and high score data in JSON format.
 */

import express from "express";
import { getusernameAndHighScore } from "../controller/indexController.js";
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
    res.json(getusernameAndHighScore());
});

export default router;