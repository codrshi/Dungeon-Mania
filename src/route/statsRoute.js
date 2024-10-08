import express from "express";
import { getStats } from "../controller/statsController.js";
import config from "../../configuration/config.js";
import { logger } from "../utility/loggerService.js";
import RenderPageException from "../exception/renderPageException.js";

const router = express.Router();

router.get(config.app.url.STATS, (req, res,next) => {
    logger(config.app.loggingLevel.INFO, "redering stats page...");

    try{
        res.render('stats',getStats(),(err,html)=>{
            if(err){
                throw new RenderPageException("stats",err.message);
            }
            res.send(html);
        });
    }
    catch(err){
        next(err);
    }
});

export default router;