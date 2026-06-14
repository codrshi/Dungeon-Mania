/*
 * loggerService.js
 *
 * Generic, level-filtered logging utility.
 *
 * Public API
 * ----------
 *   logger(level, message, ...params)
 *       Logs a message at the given level. Placeholders {0}, {1}, ... in
 *       `message` are replaced positionally with `params`.
 *
 *   setLoggingLevel(level)
 *       Set the runtime threshold. Messages strictly more verbose than this
 *       level are dropped. Unknown levels are ignored with a warning.
 *
 *   getLoggingLevel()
 *       Returns the current threshold as a string.
 *
 *   parseLogLevelFromArgs(argv)
 *       Parses `--log-level=<L>`, `--log-level <L>` or `-l <L>` from argv
 *       and returns the normalized (upper-cased) level, or null when no
 *       flag is provided.
 *
 * Levels (least -> most verbose):
 *   ERROR  -> always shown unless explicitly silenced
 *   WARN   -> ERROR + WARN
 *   INFO   -> ERROR + WARN + INFO        (default)
 *   DEBUG  -> everything
 */

import config from "../configuration/config.js";

const LEVELS = config.app.loggingLevel;

const SEVERITY = Object.freeze({
    [LEVELS.ERROR]: 0,
    [LEVELS.WARN]: 1,
    [LEVELS.INFO]: 2,
    [LEVELS.DEBUG]: 3,
});

const VALID_LEVEL_NAMES = Object.keys(SEVERITY);

let currentLevel = config.app.DEFAULT_LOGGING_LEVEL;
let currentSeverity = SEVERITY[currentLevel];

export function getLoggingLevel() {
    return currentLevel;
}

export function setLoggingLevel(level) {
    if (level == null) return;

    const normalized = String(level).toUpperCase();
    if (!(normalized in SEVERITY)) {
        console.warn(
            `[loggerService] ignoring invalid log level "${level}". ` +
            `Valid levels: ${VALID_LEVEL_NAMES.join(", ")}. ` +
            `Keeping current level "${currentLevel}".`
        );
        return;
    }

    currentLevel = normalized;
    currentSeverity = SEVERITY[normalized];
}

export function parseLogLevelFromArgs(argv) {
    if (!Array.isArray(argv)) return null;

    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === "--log-level" || arg === "-l") {
            const next = argv[i + 1];
            return next ? String(next).toUpperCase() : null;
        }
        if (typeof arg === "string" && arg.startsWith("--log-level=")) {
            return arg.slice("--log-level=".length).toUpperCase();
        }
    }
    return null;
}

function format(level, message, params) {
    const timestamp = new Date().toISOString();
    const interpolated = params.reduce(
        (acc, param, idx) => acc.replace(`{${idx}}`, param),
        message
    );
    return `[${timestamp}] [${level}] : ${interpolated}`;
}

export const logger = (level, message, ...params) => {
    const normalized = typeof level === "string" ? level.toUpperCase() : level;
    const severity = SEVERITY[normalized];

    if (severity === undefined) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [DEFAULT] : ${message}`);
        return;
    }

    if (severity > currentSeverity) return;

    const finalMessage = format(normalized, message, params);
    switch (normalized) {
        case LEVELS.ERROR:
            console.error(finalMessage);
            break;
        case LEVELS.WARN:
            console.warn(finalMessage);
            break;
        case LEVELS.INFO:
            console.info(finalMessage);
            break;
        case LEVELS.DEBUG:
            console.debug(finalMessage);
            break;
    }
};
