import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";

export function updateHealth(healthStatus,amount){
    if(healthStatus===config.game.health.INCREASE){
        eph_config.knightHealth=Math.min(config.game.health.MAX_HEALTH, eph_config.knightHealth+amount);
    }
    else if(healthStatus===config.game.health.DECREASE){
        if(eph_config.activeEnema!=null){
            amount-=Math.ceil(amount*eph_config.activeEnema.getBuff()/100);
        }
        eph_config.knightHealth=Math.max(0, eph_config.knightHealth-amount);
    }
}