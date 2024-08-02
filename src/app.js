import express from "express";
import indexRouter from "./route/indexRoute.js";
import gameRouter from "./route/gameRoute.js";
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "public")));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'template'));

app.use("/", indexRouter);
app.use("/", gameRouter);

export default app;
