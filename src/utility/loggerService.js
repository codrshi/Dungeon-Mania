/*
 * loggerService.js
 *
 * This file provides a generic logging utility that formats and outputs log messages with
 * timestamps, log levels, and formatted parameters for improved readability.
 * 
 * Functions:
 * - logger: Logs messages based on specified log levels (INFO, WARN, ERROR), using timestamped entries.
 * 
 * Usage:
 * - The logger function accepts a log level, a message string, and optional parameters to format
 *   the message. Parameters are injected into placeholders ({0}, {1}, ...) in the message string.
 * - Log levels are defined in the configuration file and mapped to the appropriate console method:
 *   - INFO: Displays informational messages in the console.
 *   - WARN: Displays warning messages in the console.
 *   - ERROR: Displays error messages in the console.
 *   - DEFAULT: If an unrecognized level is passed, logs with a default label.
 */

import config from "../configuration/config.js";

export const logger = (level, message, ...params) => {
    const timestamp = new Date().toISOString();
    message = params.reduce((message, param, index) => message.replace(`{${index}}`, param), message);
    const loggerfinalMessage = `[${timestamp}] [${level}] : ${message}`;

    switch (level) {
        case config.app.loggingLevel.INFO: console.info(loggerfinalMessage);
            break;
        case config.app.loggingLevel.WARN: console.warn(loggerfinalMessage);
            break;
        case config.app.loggingLevel.ERROR: console.error(loggerfinalMessage);
            break;
        default:
            console.log(`[${timestamp}] [DEFAULT] : ${message}`);
    }
};
