import express from "express";
import {resData} from "../controller/indexController.js";

const router = express.Router();

router.get('/',(req,res) => {
    res.render('index',resData);
})

export default router;