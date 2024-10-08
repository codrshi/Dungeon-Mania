import express from "express";
import indexRouter from "./route/indexRoute.js";
import gameRouter from "./route/gameRoute.js";
import statsRouter from "./route/statsRoute.js";
import guideRouter from "./route/guideRoute.js";
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from "./utility/loggerService.js";
import config from "../configuration/config.js";
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
