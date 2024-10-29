/*
 * guideRoute.js
 *
 * Route Definition: Guide Page Route
 *
 * Description:
 * - This route file defines the endpoint and associated logic to render the 'guide' page of the application.
 *
 * Route Logic:
 * - The GET route listens on the URL defined in `config.app.url.GUIDE` for rendering the guide page.
 * - On a successful request, it attempts to render the 'guide' page template using `res.render()`.
 * - If an error occurs during rendering, a `RenderPageException` is thrown, capturing both the page name ('guide') and the error message.
 * - All caught errors are passed to the next middleware function for centralized error handling.
 *
 * Route Path:
 * - GET `config.app.url.GUIDE`: Render and serve the 'guide' page.
 */

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