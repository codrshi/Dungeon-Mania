/* statsPersistence.js
 *
 * On-disk persistence for `stats_config` (the lifetime stats + remembered
 * username). The save lives at the OS-native user-data directory so it
 * survives app upgrades / re-installs and stays out of the application's
 * install location:
 *
 *   Windows: %LOCALAPPDATA%\Dungeon-Mania\Data\stats.json
 *   macOS:   ~/Library/Application Support/Dungeon-Mania/stats.json
 *   Linux:   $XDG_DATA_HOME/Dungeon-Mania/stats.json
 *            (falls back to ~/.local/share/Dungeon-Mania/stats.json)
 *
 * Design:
 *   - Single document model (one player, one stats object); no concurrency.
 *   - Atomic writes (temp file + rename) so a crash mid-write can't leave a
 *     partial file that breaks subsequent loads.
 *   - Tolerates missing / unreadable / corrupt / version-mismatched files
 *     by logging a WARN and falling back to defaults -- the game must
 *     always be playable, even on a locked-down corporate box where the
 *     user-data dir isn't writeable.
 *   - Schema version is recorded so future field renames / shape changes
 *     can be migrated explicitly.
 *
 * `eph_config` and `temp_stats_config` are intentionally NOT persisted --
 * they're per-game state and already reset by clearEphConfig().
 */

import fs from "fs";
import path from "path";
import envPaths from "env-paths";

import config from "../configuration/config.js";
import stats_config from "../configuration/stats_config.js";
import { logger } from "./loggerService.js";

const loggingLevel = config.app.loggingLevel;

const SCHEMA_VERSION = 1;

const paths = envPaths("Dungeon-Mania", { suffix: "" });
const STATS_DIR = paths.data;
const STATS_FILE = path.join(STATS_DIR, "stats.json");
const STATS_TMP_FILE = STATS_FILE + ".tmp";

export function getStatsFilePath() {
    return STATS_FILE;
}

export function loadStats() {
    let raw;
    try {
        raw = fs.readFileSync(STATS_FILE, "utf8");
    } catch (err) {
        if (err.code === "ENOENT") {
            logger(loggingLevel.INFO, "no existing save at {0}; starting fresh.", STATS_FILE);
        } else {
            logger(loggingLevel.WARN, "could not read save at {0}: {1}. starting fresh.", STATS_FILE, err.message);
        }
        return false;
    }

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        logger(loggingLevel.WARN, "save file at {0} is not valid JSON: {1}. starting fresh.", STATS_FILE, err.message);
        return false;
    }

    if (!parsed || typeof parsed !== "object") {
        logger(loggingLevel.WARN, "save file at {0} is not a JSON object. starting fresh.", STATS_FILE);
        return false;
    }

    if (parsed.schemaVersion !== SCHEMA_VERSION) {
        logger(
            loggingLevel.WARN,
            "save file at {0} has schemaVersion={1}, expected {2}; ignoring it. starting fresh.",
            STATS_FILE,
            parsed.schemaVersion,
            SCHEMA_VERSION
        );
        return false;
    }

    if (!parsed.stats_config || typeof parsed.stats_config !== "object") {
        logger(loggingLevel.WARN, "save file at {0} is missing stats_config. starting fresh.", STATS_FILE);
        return false;
    }

    mergeIntoDefaults(stats_config, parsed.stats_config);

    logger(loggingLevel.INFO, "loaded save from {0}.", STATS_FILE);
    return true;
}

export function saveStats() {
    try {
        fs.mkdirSync(STATS_DIR, { recursive: true });
    } catch (err) {
        logger(loggingLevel.WARN, "could not create save directory {0}: {1}. stats will not persist this run.", STATS_DIR, err.message);
        return false;
    }

    const payload = JSON.stringify(
        { schemaVersion: SCHEMA_VERSION, stats_config },
        null,
        2
    );

    try {
        fs.writeFileSync(STATS_TMP_FILE, payload, "utf8");
        fs.renameSync(STATS_TMP_FILE, STATS_FILE);
    } catch (err) {
        logger(loggingLevel.WARN, "could not write save at {0}: {1}.", STATS_FILE, err.message);

        try { fs.unlinkSync(STATS_TMP_FILE); } catch (_) { /* ignore */ }
        return false;
    }

    logger(loggingLevel.DEBUG, "saved stats to {0}.", STATS_FILE);
    return true;
}

function mergeIntoDefaults(target, source) {
    for (const key of Object.keys(target)) {
        if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

        const tVal = target[key];
        const sVal = source[key];

        if (isPlainObject(tVal) && isPlainObject(sVal)) {
            mergeIntoDefaults(tVal, sVal);
        } else if (typeof tVal === typeof sVal || tVal === "-" || sVal === null) {
            target[key] = sVal;
        } else {
            logger(
                loggingLevel.WARN,
                "save field {0} has unexpected type ({1} vs {2}); keeping default.",
                key,
                typeof sVal,
                typeof tVal
            );
        }
    }
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
