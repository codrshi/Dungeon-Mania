import eph_config from "../../configuration/ephemeral_config.js";
import config from "../../configuration/config.js";
import { getGrid } from "./gridAccessor.js";
import { initializeMageGrid } from "./mageGridAccessor.js";
import { mapGrid } from "./gridToImageMapper.js";
import { terminateGame } from "./terminateGameUtility.js";

export function appreciateAura(auraStatus,amount){

    if(auraStatus===config.game.aura.DECREASE){
        eph_config.aura-= Math.ceil(eph_config.aura*amount/100);
        eph_config.aura = Math.max(0,eph_config.aura);
    
        if(eph_config.aura===0){
            terminateGame(config.game.gameStatus.LOST);
            eph_config.screenLogs.push("- aura exhausted.")
        }
        return;
    }

    if(eph_config.isAuraThresholdThreeCrossed)
        return;

    eph_config.aura+=Math.ceil(Math.pow(Math.PI,Math.log10(amount))+Math.sqrt(amount));
    eph_config.aura = Math.min(config.game.aura.AURA_THRESHOLD_3,eph_config.aura);

    if(eph_config.aura == config.game.aura.AURA_THRESHOLD_3 && eph_config.isSurvivalMode === false && eph_config.isAuraThresholdThreeCrossed === false){
        console.log("threshold 3 crossed");
        eph_config.newCardLocations=[];
        initializeMageGrid();
        eph_config.newGrid=mapGrid(getGrid());
        eph_config.isAuraThresholdThreeCrossed=true;
        eph_config.screenLogs.push("- aura maxed. Entered mage realm.")
    }

}