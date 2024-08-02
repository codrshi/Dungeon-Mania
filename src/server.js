import app from "./app.js";
import config from "../configuration/config.js";

const PORT = config.app.PORT;

app.listen(PORT, () => {
  console.log(`game started and running in http://localhost:${PORT}/`);
});
