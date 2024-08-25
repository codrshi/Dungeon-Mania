import express from "express";
import {resData} from "../controller/indexController.js";
import config from "../../configuration/config.js";

const router = express.Router();

router.get(config.app.url.HOME_PAGE,(req,res) => {
    res.render('index',resData);
})

export default router;