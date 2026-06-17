/*
 * server.js
 *
 * Entry Point for the Express Application Server
 *
 * Supported CLI flags:
 *   --log-level=<LEVEL>   Set runtime log threshold (DEBUG | INFO | WARN | ERROR)
 *   --log-level <LEVEL>   Same as above, space-separated form
 *   -l <LEVEL>            Short alias
 *   --no-browser          Don't try to open a browser (Docker / headless / CI)
 *   --port=<N>            Override the listening port (equivalent to PORT env)
 *   --port <N>            Same as above, space-separated form
 *
 * If no log-level flag is supplied the default level is INFO. Invalid
 * values are ignored with a warning and the default is kept.
 *
 * Port resolution order:
 *   1. --port=<N> CLI flag
 *   2. PORT env var
 *   3. config.app.PORT (3030)
 *   4. Falls back to an OS-assigned free port if the chosen one is busy.
 *
 * Browser auto-open is skipped when ANY of these are true:
 *   - --no-browser is on the CLI
 *   - DUNGEON_MANIA_NO_BROWSER env var is set (truthy)
 *   - stdout is not a TTY (Docker / piped output / CI)
 *
 * Module-load ordering note:
 *   We use only static imports (no top-level await) so the same source
 *   file can be bundled by esbuild into a CommonJS blob for Node SEA,
 *   which does not allow top-level await in CJS. To preserve the
 *   "configure logger and load stats BEFORE any controller does
 *   anything" guarantee, none of the transitive imports below do
 *   module-level work that calls the logger or touches stats_config --
 *   they only declare exports. The actual ordering is enforced by the
 *   statements in the body of this file (setLoggingLevel -> loadStats
 *   -> ensureUsername -> app.listen).
 *
 * Examples:
 *   node src/server.js
 *   node src/server.js --log-level=DEBUG
 *   node src/server.js -l warn --no-browser
 *   PORT=4000 node src/server.js
 */

import config from "./configuration/config.js";
import {
    logger,
    parseLogLevelFromArgs,
    setLoggingLevel,
    getLoggingLevel,
} from "./utility/loggerService.js";
import { loadStats } from "./utility/statsPersistence.js";
import { ensureUsername } from "./controller/indexController.js";
import app from "./app.js";

const loggingLevel = config.app.loggingLevel;

const requestedLevel = parseLogLevelFromArgs(process.argv);
if (requestedLevel) {
    setLoggingLevel(requestedLevel);
}

loadStats();
ensureUsername();

const requestedPort = resolveRequestedPort(process.argv);
const shouldOpenBrowser = resolveShouldOpenBrowser(process.argv);

startListening(requestedPort, shouldOpenBrowser);

function resolveRequestedPort(argv) {
    const fromCli = parsePortFromArgs(argv);
    if (fromCli != null) return fromCli;

    const fromEnv = parsePortValue(process.env.PORT);
    if (fromEnv != null) return fromEnv;

    return config.app.PORT;
}

function parsePortFromArgs(argv) {
    if (!Array.isArray(argv)) return null;

    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--port" || arg === "-p") {
            return parsePortValue(argv[i + 1]);
        }
        if (typeof arg === "string" && arg.startsWith("--port=")) {
            return parsePortValue(arg.slice("--port=".length));
        }
    }
    return null;
}

function parsePortValue(raw) {
    if (raw == null || raw === "") return null;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > 65535) {
        logger(loggingLevel.WARN, "ignoring invalid port value \"{0}\".", raw);
        return null;
    }
    return n;
}

function resolveShouldOpenBrowser(argv) {
    if (Array.isArray(argv) && argv.includes("--no-browser")) return false;
    if (process.env.DUNGEON_MANIA_NO_BROWSER) return false;

    if (!process.stdout || !process.stdout.isTTY) return false;
    return true;
}

function startListening(port, shouldOpenBrowser) {
    const server = app.listen(port, onListening);

    server.on("error", (err) => {
        if (err && err.code === "EADDRINUSE" && port !== 0) {
            logger(
                loggingLevel.WARN,
                "port {0} is already in use; falling back to an OS-assigned free port.",
                port
            );
            startListening(0, shouldOpenBrowser);
            return;
        }
        logger(loggingLevel.ERROR, "failed to start server: {0}.", err && err.message ? err.message : err);
        process.exit(1);
    });

    function onListening() {
        const addr = server.address();
        const actualPort = addr && typeof addr === "object" ? addr.port : port;
        const url = `http://localhost:${actualPort}/`;

        logger(
            loggingLevel.INFO,
            `game started on ${url} (log level = ${getLoggingLevel()})`
        );

        if (shouldOpenBrowser) {
            import("open")
                .then(({ default: open }) => open(url))
                .catch((err) => {
                    logger(
                        loggingLevel.WARN,
                        "could not auto-open browser: {0}. open {1} manually.",
                        err && err.message ? err.message : err,
                        url
                    );
                });
        }
    }
}
