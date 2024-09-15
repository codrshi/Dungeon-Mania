import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";
import stats_config from "../../configuration/stats_config.js";
import temp_stats_config from "../../configuration/temp_stats_config.js";
import {getGrid, initializeGrid, setGrid} from "../utility/gridAccessor.js";
import {mapGrid} from "../utility/gridToImageMapper.js";

export function setInit(isSurvivalMode){
    
    eph_config.isSurvivalMode=(isSurvivalMode==='true');
    
    if(getGrid().length==0)
        initializeGrid();

    const initResData={
        username: stats_config.basicStats.username,
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
    eph_config.screenLogs=['- click on the dice icon to start the game.'];

    setGrid([]);
    clearTempStatsConfig();
}

function clearTempStatsConfig(){
    temp_stats_config.basicStats.totalGamesMoves=0;

    temp_stats_config.monsterStats.totalMonstersKilled=0;
    temp_stats_config.monsterStats.totalMonstersKilled=0;
    temp_stats_config.monsterStats.monsterKillingStreakMoves=0;
    temp_stats_config.monsterStats.strongestMonsterKilledHealth="-";
    temp_stats_config.monsterStats.strongestMonsterKilledName="-";

    temp_stats_config.weaponStats.totalweaponsGrabbed=0;
    temp_stats_config.weaponStats.strongestWeaponName="-";
    temp_stats_config.weaponStats.strongestWeaponAttribute="-";
    temp_stats_config.weaponStats.weaponUsage = new Array(4).fill(0);

    temp_stats_config.weaponStats.totalArtifactsPicked=0;
    temp_stats_config.weaponStats.artifactUsage = new Array(9).fill(0);
}
