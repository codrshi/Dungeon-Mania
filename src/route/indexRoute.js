import express from "express";
import {resData} from "../controller/indexController.js";
import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";

const router = express.Router();

router.get(config.app.url.HOME_PAGE,(req,res) => {
    res.render('index',resData);
})

router.get(config.app.url.HOME_PAGE_EPH_CONFIG,(req,res) => {
    res.json({
        eph_config: eph_config
    });
});

export default router;