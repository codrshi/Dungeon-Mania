/*
 * server.js
 *
 * Entry Point for the Express Application Server
 *
 * Parses command-line flags and starts the HTTP listener.
 *
 * Supported flags:
 *   --log-level=<LEVEL>   Set runtime log threshold (DEBUG | INFO | WARN | ERROR)
 *   --log-level <LEVEL>   Same as above, space-separated form
 *   -l <LEVEL>            Short alias
 *
 * If no flag is supplied the default level is INFO. Invalid values are
 * ignored with a warning and the default is kept.
 *
 * Examples:
 *   node src/server.js
 *   node src/server.js --log-level=DEBUG
 *   node src/server.js -l warn
 */

import config from "./configuration/config.js";
import {
    logger,
    parseLogLevelFromArgs,
    setLoggingLevel,
    getLoggingLevel,
} from "./utility/loggerService.js";

const requestedLevel = parseLogLevelFromArgs(process.argv);
if (requestedLevel) {
    setLoggingLevel(requestedLevel);
}

const { default: app } = await import("./app.js");

const PORT = config.app.PORT;

app.listen(PORT, () => {
    logger(
        config.app.loggingLevel.INFO,
        `game started on http://localhost:${PORT}/ (log level = ${getLoggingLevel()})`
    );
});
