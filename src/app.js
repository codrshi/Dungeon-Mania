/*
 * app.js
 *
 * Express Application Initialization and Middleware Configuration
 *
 * Description:
 * - This file serves as the entry point for the Express application.
 * - It sets up middleware, routes, and error handling for the application.
 *
 * Middleware Configuration:
 * - Parses incoming JSON requests using express.json().
 * - Serves static files from the "public" directory at the "/static" route.
 * - Configures the view engine to use EJS and sets the views directory to "template".
 *
 * Route Handlers:
 * - Mounts the indexRouter, gameRouter, statsRouter, and guideRouter to handle requests to the root path ("/").
 *
 * Error Handling:
 * - Centralized error handling middleware that captures and logs errors.
 * - Differentiates between specific exception types (e.g., RenderPageException, InvalidCoordinateException)
 *   and responds with appropriate error messages and status codes.
 * - Logs unknown errors and responds with a generic 'Internal Server Error' message.
 *
 * Graceful Shutdown:
 * - Listens for the SIGINT signal to log a shutdown message and terminate the process gracefully.
 * - Handles unhandled promise rejections by logging the error details and associated promise.
 *
 * Exports:
 * - Exports the configured Express application instance for use in other modules.
 */

import express from "express";
import indexRouter from "./route/indexRoute.js";
import gameRouter from "./route/gameRoute.js";
import statsRouter from "./route/statsRoute.js";
import guideRouter from "./route/guideRoute.js";
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from "./utility/loggerService.js";
import config from "./configuration/config.js";
import RenderPageException from "./exception/renderPageException.js";
import InvalidCoordinateException from "./exception/invalidCoordinateException.js";
import ExcessActivePoisonException from "./exception/excessActivePoisonException.js";
import UndefinedCardException from "./exception/undefinedCardException.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "public")));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'template'));

app.use("/", indexRouter);
app.use("/", gameRouter);
app.use("/", statsRouter);
app.use("/", guideRouter);

app.use((err, req, res, next) => {
    if (err instanceof RenderPageException) {
        logger(config.app.loggingLevel.ERROR, err.stack);
        res.status(500).json({ error: err.message });
    }
    else if (err instanceof InvalidCoordinateException || err instanceof ExcessActivePoisonException || err instanceof UndefinedCardException) {
        logger(config.app.loggingLevel.ERROR, err.stack);
        res.status(500).json({ error: "an unexpected error occured." });
    }
    else {
        logger(config.app.loggingLevel.ERROR, `Unknown error occured: ${err.name}: ${err.message}`);
        logger(config.app.loggingLevel.ERROR, err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


process.on('SIGINT', () => {
    logger(config.app.loggingLevel.INFO, "gracefully shutting down the game.");
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    const error = new UnhandledPromiseRejectionException(
        `Unhandled promise rejection: ${reason.message || reason}`,
        promise
    );
    error.logError();
});

export default app;
