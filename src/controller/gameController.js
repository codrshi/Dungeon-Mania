import eph_config from "../../configuration/ephemeral_config.js";
import {getGrid,setGrid,createNewCard} from "../utility/gridAccessor.js";
import {mapGrid} from "../utility/gridToImageMapper.js";
import {getRandom} from "../utility/RNG.js";
import config from "../../configuration/config.js";
import { WeaponDao } from "../dao/weaponDao.js";
import { MonsterDao } from "../dao/monsterDao.js";
import { KnightDao } from "../dao/knightDao.js";
import Element from "../model/element.js"
import { updateScore } from "../utility/scoreUpdater.js";
import ActionType from "../model/actionType.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { shuffleGrid } from "../utility/gridShuffler.js";
import { CoordinateDao } from "../dao/coordinateDao.js";

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
        validNextPositions.push(new CoordinateDao((eph_config.coordinate.x + movement[0] * diceNumber + config.game.grid.ROWS)%config.game.grid.ROWS,
                                (eph_config.coordinate.y + movement[1] * diceNumber + config.game.grid.ROWS)%config.game.grid.ROWS));
        
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

    newKnightCoordinate=new CoordinateDao(newKnightCoordinate[0],newKnightCoordinate[1]);
    eph_config.shuffledGrid=[];
    const grid=getGrid();
    const newCard=grid[newKnightCoordinate.getX()][newKnightCoordinate.getY()];

    let [prevPosCardId,prevPosNewAttribute] = createNewCard(eph_config.coordinate.x,eph_config.coordinate.y);
    grid[newKnightCoordinate.getX()][newKnightCoordinate.getY()]=new KnightDao();
    eph_config.coordinate.x=newKnightCoordinate.getX();
    eph_config.coordinate.y=newKnightCoordinate.getY();

    if(newCard instanceof WeaponDao){
        dealWeapon(newCard);
    }
    else if(newCard instanceof MonsterDao){
        dealMonster(newCard);
    }
    else if(newCard instanceof ArtifactDao){
        dealArtifact(newCard,diceNumber);
    }

    const processMoveResData={
        prevPosCardId: prevPosCardId,
        prevPosNewAttribute: prevPosNewAttribute,
        eph_config: eph_config
    }
    return processMoveResData;
}

function dealWeapon(weaponCard){
    eph_config.knightWeapon = new WeaponDao(weaponCard.getDamage(),weaponCard.getElement(),weaponCard.getId());
}

function dealMonster(monsterCard){
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
        gameOver();
    }
    else{
        updateScore(ActionType.MONSTER,scoreSpan);
    }
}

function dealArtifact(artifactCard,diceNumber){
    let artifactSpan=0;

    switch(artifactCard.getId()){
        case config.game.id.artifact.BOMB:
            artifactSpan=Math.ceil(10*(Math.log(Math.pow(2,diceNumber))+Math.log(Math.pow(1.5,diceNumber)))/Math.pow(Math.E,1/diceNumber)  + 10/diceNumber);
            eph_config.knightHealth=Math.max(eph_config.knightHealth-artifactSpan,0);

            if(eph_config.knightHealth==0){
                gameOver();
            }

            break;
        case config.game.id.artifact.CHAOS_ORB:
            setGrid(shuffleGrid(getGrid()));
            eph_config.shuffledGrid=mapGrid(getGrid());
            break;
        case config.game.id.artifact.ENEMA_ELIXIR:
            break;
        case config.game.id.artifact.HEALTH_POTION:
            artifactSpan=Math.ceil(10*Math.log(Math.pow(2,diceNumber))/Math.pow(Math.E,1/diceNumber));
            eph_config.knightHealth=Math.min(eph_config.knightHealth+artifactSpan,config.game.MAX_HEALTH);

            break;
        case config.game.id.artifact.MANA_STONE:
            dealManaStone();
            break;
        case config.game.id.artifact.POISON_POTION:
            artifactSpan=Math.ceil(10*(Math.log(Math.pow(1.5,diceNumber)))/Math.pow(Math.E,1/diceNumber)+5/diceNumber);

            break;
        case config.game.id.artifact.WEAPON_FORGER:
            artifactSpan=Math.ceil(10*Math.log(Math.pow(2,diceNumber))/Math.pow(Math.E,1/diceNumber) + 10/diceNumber);

            if(eph_config.knightWeapon!=null){
                eph_config.knightWeapon.setDamage(eph_config.knightWeapon.getDamage()+artifactSpan);
            }

            break;
        case config.game.id.artifact.MYSTERY_CHEST:
            break;
        default:
            break;
    }
}

function gameOver(){
    console.log("GAME OVER!")
}