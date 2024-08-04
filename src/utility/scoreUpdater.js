import eph_config from "../../configuration/ephemeral_config.js";
import ActionType from "../model/actionType.js";

export function updateScore(actionType,value){
    if(actionType===ActionType.MONSTER){
        eph_config.score+=value;
    }
}