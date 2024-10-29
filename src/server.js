/*
 * server.js
 *
 * Entry Point for the Express Application Server
 *
 * Description:
 * - This file initializes and starts the Express server for the application.
 * - It imports the configured Express app and relevant configuration settings.
 *
 * Server Configuration:
 * - Retrieves the port number from the application configuration (config.app.PORT).
 *
 * Server Initialization:
 * - Listens for incoming connections on the specified port.
 * - Logs a message indicating that the game has started and provides the URL for access.
 *
 * Exports:
 * - This file does not export any modules; it serves solely to start the server.
 */

import app from "./app.js";
import config from "../configuration/config.js";
import { logger } from "./utility/loggerService.js";

const PORT = config.app.PORT;

app.listen(PORT, () => {
  logger(config.app.loggingLevel.INFO, `game started and running in http://localhost:${PORT}/`);
});
