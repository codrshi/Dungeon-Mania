import eph_config from "../../configuration/ephemeral_config.js";
import {getGrid,updateCell} from "../utility/gridAccessor.js";
import {mapGrid} from "../utility/gridToImageMapper.js";
import {getRandom} from "../utility/RNG.js";
import config from "../../configuration/config.js";
import { WeaponDao } from "../dao/weaponDao.js";
import { MonsterDao } from "../dao/monsterDao.js";
import Element from "../model/element.js"
import { updateScore } from "../utility/scoreUpdater.js";
import ActionType from "../model/actionType.js";

export function setInit(){

    eph_config.knightHealth=config.game.MAX_HEALTH;
    eph_config.knightWeapon=null;

    const initResData={
        username: eph_config.username,
        grid: mapGrid(getGrid())
    }
    return initResData;
}

export function rollDiceExecute(){
    const diceNumber=getRandom(1,6);
    let validNextPositions=[];
    const movements=[[config.game.coordinate.UP_X,config.game.coordinate.UP_Y],
                    [config.game.coordinate.DOWN_X,config.game.coordinate.DOWN_Y],
                    [config.game.coordinate.LEFT_X,config.game.coordinate.LEFT_Y],
                    [config.game.coordinate.RIGHT_X,config.game.coordinate.RIGHT_Y],
                    [config.game.coordinate.UP_X+config.game.coordinate.LEFT_X,config.game.coordinate.UP_Y+config.game.coordinate.LEFT_Y],
                    [config.game.coordinate.UP_X+config.game.coordinate.RIGHT_X,config.game.coordinate.UP_Y+config.game.coordinate.RIGHT_Y],
                    [config.game.coordinate.DOWN_X+config.game.coordinate.LEFT_X,config.game.coordinate.DOWN_Y+config.game.coordinate.LEFT_Y],
                    [config.game.coordinate.DOWN_X+config.game.coordinate.RIGHT_X,config.game.coordinate.DOWN_Y+config.game.coordinate.RIGHT_Y]];

    for(const movement of movements) {
        validNextPositions.push([(eph_config.coordinate.x + movement[0] * diceNumber + config.game.grid.ROWS)%config.game.grid.ROWS,
                                (eph_config.coordinate.y + movement[1] * diceNumber + config.game.grid.ROWS)%config.game.grid.ROWS]);
        
        if(validNextPositions.length==4 && !eph_config.isDiagonalMovement)
            break;
    };

    const rollDiceResData={
        diceNumber: diceNumber,
        validNextPositions: validNextPositions
    };
    return rollDiceResData;
}

export function processMove(newKnightCoordinate,diceNumber){

    const grid=getGrid();
    const newCard=grid[newKnightCoordinate[0]][newKnightCoordinate[1]];

    if(newCard instanceof WeaponDao){
        eph_config.knightWeapon = new WeaponDao(newCard.getDamage(),newCard.getElement(),newCard.getId());
    }
    else if(newCard instanceof MonsterDao){
        dealDamage(newCard);
    }

    let [prevPosCardId,prevPosNewAttribute] = updateCell(newKnightCoordinate);

    const processMoveResData={
        prevPosCardId: prevPosCardId,
        prevPosNewAttribute: prevPosNewAttribute,
        eph_config: eph_config
    }
    return processMoveResData;
}

function dealDamage(monsterCard){
    let monsterElement=monsterCard.getElement();
    let knightWeaponElement=null;
    let monsterHealth=monsterCard.getHealth();
    let knightWeaponDamage=0;

    if(eph_config.knightWeapon!=null){

        knightWeaponDamage=eph_config.knightWeapon.getDamage();
        knightWeaponElement=eph_config.knightWeapon.getElement();

        if(monsterElement==null){
            monsterHealth= Math.ceil(monsterHealth/config.game.COMMON_MONSTER_DAMAGE_MULTIPLIER);
        }
        else if(Element.getEffectiveCounterElement(knightWeaponElement)===monsterElement){
            monsterHealth= Math.ceil(monsterHealth/config.game.COUNTER_WEAPON_DAMAGE_MULTIPLIER);
        }
        else if(Element.getIneffectiveCounterElement(knightWeaponElement)===monsterElement){
            monsterHealth= Math.ceil(monsterHealth*config.game.COUNTER_WEAPON_DAMAGE_MULTIPLIER);
        }
    }
    
    let scoreSpan=Math.min(monsterHealth,knightWeaponDamage+eph_config.knightHealth);
    knightWeaponDamage-=monsterHealth;

    if(knightWeaponDamage<0){
        eph_config.knightHealth -= Math.abs(knightWeaponDamage);
    }

    if(knightWeaponDamage <=0){
        eph_config.knightWeapon=null;
    }
    if(eph_config.knightWeapon!=null){
        eph_config.knightWeapon.setDamage(knightWeaponDamage);
    }
    if(eph_config.knightHealth <= 0){
        console.log("GAME OVER!");
    }
    else{
        updateScore(ActionType.MONSTER,scoreSpan);
    }
}
