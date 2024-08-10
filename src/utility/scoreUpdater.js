import eph_config from "../../configuration/ephemeral_config.js";

export function updateScore(value){
    if(eph_config.activeEnema!=null){
        value+=Math.ceil(value*eph_config.activeEnema.getBuff()/100);
    }
    eph_config.score+=value;
}