import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";
import {getGrid, initializeGrid, setGrid} from "../utility/gridAccessor.js";
import {mapGrid} from "../utility/gridToImageMapper.js";

export function setInit(isSurvivalMode){
    
    eph_config.isSurvivalMode=(isSurvivalMode==='true');
    
    if(getGrid().length==0)
        initializeGrid();

    const initResData={
        username: eph_config.username,
        grid: mapGrid(getGrid())
    }
    return initResData;
}

export function clearEphConfig(){
    restoreDefaultEphConfig();
}

function restoreDefaultEphConfig(){
    eph_config.knightHealth=config.game.health.MAX_HEALTH;
    eph_config.knightWeapon=null;
    eph_config.score=0;
    eph_config.newGrid=[];
    eph_config.newCardLocations=[];
    eph_config.activePoisons=[];
    eph_config.activeEnema=null;
    eph_config.aura=0;
    eph_config.isAuraThresholdThreeCrossed=false;
    eph_config.escapeDoorCountdown=0;
    eph_config.currentGameStatus = config.game.gameStatus.ONGOING;
    eph_config.coordinate.x=0;
    eph_config.coordinate.y=0;
    eph_config.mageCoordinate.x=2;
    eph_config.mageCoordinate.y=2;

    setGrid([]);
}

