import eph_config from "../../configuration/ephemeral_config.js";
import temp_stats_config from "../../configuration/temp_stats_config.js";

export function updateScore(value){
    if(eph_config.knightHealth === 0)
        return;
    if(eph_config.activeEnema!=null){
        value+=Math.ceil(value*eph_config.activeEnema.getBuff()/100);
    }
    eph_config.score+=value;
}