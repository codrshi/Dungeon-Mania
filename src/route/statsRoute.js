/*
 * statsRoute.js
 *
 * Route Definition: Stats Page Endpoint
 *
 * Description:
 * - This route file handles requests to render the stats page, displaying the player’s accumulated game statistics.
 *
 * Route Logic:
 * 1. Stats Page Route (GET `config.app.url.STATS`):
 *    - Logs an informational message indicating the stats page rendering process.
 *    - Calls `getStats()` to obtain the player’s current statistics.
 *    - Renders the stats page template ('stats') with the retrieved data.
 *    - If an error occurs during rendering, a `RenderPageException` is thrown, containing the page name ('stats') and the specific error message.
 *    - Any caught errors are forwarded to the next middleware function for centralized error handling.
 *
 * Route Paths:
 * - GET `config.app.url.STATS`: Render and serve the stats page with player statistics data.
 */

import express from "express";
import { getStats } from "../controller/statsController.js";
import config from "../../configuration/config.js";
import { logger } from "../utility/loggerService.js";
import RenderPageException from "../exception/renderPageException.js";

const router = express.Router();

router.get(config.app.url.STATS, (req, res, next) => {
    logger(config.app.loggingLevel.INFO, "redering stats page...");

    try {
        res.render('stats', getStats(), (err, html) => {
            if (err) {
                throw new RenderPageException("stats", err.message);
            }
            res.send(html);
        });
    }
    catch (err) {
        next(err);
    }
});

export default router;