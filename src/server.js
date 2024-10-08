import app from "./app.js";
import config from "../configuration/config.js";
import {logger} from "./utility/loggerService.js";

const PORT = config.app.PORT;

app.listen(PORT, () => {
  logger(config.app.loggingLevel.INFO,`game started and running in http://localhost:${PORT}/`);
});
