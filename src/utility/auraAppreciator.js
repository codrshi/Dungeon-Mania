import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";

let auraThresholdOne=false,auraThresholdTwo=false,auraThresholdThree=false;

export function appreciateAura(auraStatus,amount){

    if(auraStatus===config.game.aura.DECREASE){
        eph_config.aura-= Math.ceil(eph_config.aura*amount/100);
        eph_config.aura = Math.max(0,eph_config.aura);
        return;
    }

    eph_config.aura+=Math.ceil(Math.pow(Math.PI,Math.log10(amount))+Math.sqrt(amount));
    eph_config.aura = Math.min(config.game.aura.AURA_THERSHOLD_3,eph_config.aura);
    console.log("aura "+Math.ceil(Math.pow(Math.PI,Math.log10(amount))+Math.sqrt(amount))+" "+eph_config.aura);

    if(amount >= config.game.aura.AURA_THRESHOLD_1 && auraThresholdOne==false){
        console.log("threshold 1 crossed");
        auraThresholdOne=true;
    }
    if(amount >= config.game.aura.AURA_THRESHOLD_2 && auraThresholdTwo==false){
        console.log("threshold 2 crossed");
        auraThresholdTwo=true;
    }
    if(amount == config.game.aura.AURA_THRESHOLD_1 && auraThresholdThree==false){
        console.log("threshold 2 crossed")
        auraThresholdThree=true;
    }

}