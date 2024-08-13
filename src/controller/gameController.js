import eph_config from "../../configuration/ephemeral_config.js";
import {getGrid,setGrid,createNewCard,getRandomArtifact} from "../utility/gridAccessor.js";
import {mapGrid} from "../utility/gridToImageMapper.js";
import {getRandom} from "../utility/RNG.js";
import config from "../../configuration/config.js";
import { WeaponDao } from "../dao/weaponDao.js";
import { MonsterDao } from "../dao/monsterDao.js";
import { KnightDao } from "../dao/knightDao.js";
import Element from "../model/element.js"
import { updateScore } from "../utility/scoreUpdater.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { shuffleGrid } from "../utility/gridShuffler.js";
import { CoordinateDao } from "../dao/coordinateDao.js";
import { ActivePoisonDao } from "../dao/activePoisonDao.js";
import {ActiveEnemaDao} from "../dao/activeEnemaDao.js";
import { updateHealth } from "../utility/healthUpdater.js";
import { appreciateAura } from "../utility/auraAppreciator.js";

const movements=[[config.game.coordinate.UP_X,config.game.coordinate.UP_Y],
                    [config.game.coordinate.DOWN_X,config.game.coordinate.DOWN_Y],
                    [config.game.coordinate.LEFT_X,config.game.coordinate.LEFT_Y],
                    [config.game.coordinate.RIGHT_X,config.game.coordinate.RIGHT_Y],
                    [config.game.coordinate.UP_X+config.game.coordinate.LEFT_X,config.game.coordinate.UP_Y+config.game.coordinate.LEFT_Y],
                    [config.game.coordinate.UP_X+config.game.coordinate.RIGHT_X,config.game.coordinate.UP_Y+config.game.coordinate.RIGHT_Y],
                    [config.game.coordinate.DOWN_X+config.game.coordinate.LEFT_X,config.game.coordinate.DOWN_Y+config.game.coordinate.LEFT_Y],
                    [config.game.coordinate.DOWN_X+config.game.coordinate.RIGHT_X,config.game.coordinate.DOWN_Y+config.game.coordinate.RIGHT_Y]];

export function setInit(){

    eph_config.knightHealth=config.game.health.MAX_HEALTH;
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

    for(const movement of movements) {
        validNextPositions.push(new CoordinateDao((eph_config.coordinate.x + movement[0] * diceNumber + config.game.grid.ROWS)%config.game.grid.ROWS,
                                (eph_config.coordinate.y + movement[1] * diceNumber + config.game.grid.ROWS)%config.game.grid.ROWS));
        
        if(validNextPositions.length==4 && eph_config.aura < config.game.aura.AURA_THRESHOLD_2)
            break;
    };

    const rollDiceResData={
        diceNumber: diceNumber,
        validNextPositions: validNextPositions
    };
    return rollDiceResData;
}

export function processMove(newKnightCoordinate,diceNumber){

    preProcessMove();

    const grid=getGrid();
    newKnightCoordinate=new CoordinateDao(newKnightCoordinate[0],newKnightCoordinate[1]);
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

    postProcessMove(diceNumber);

    const processMoveResData={
        prevPosCardId: prevPosCardId,
        prevPosNewAttribute: prevPosNewAttribute,
        eph_config: eph_config
    }
    return processMoveResData;
}

function preProcessMove(){
    eph_config.shuffledGrid=[];
    eph_config.newCardLocations=[];

    eph_config.activePoisons.forEach((activePoison,i) => {
        updateHealth(config.game.health.DECREASE,activePoison.getDamage());
        eph_config.activePoisons[i].setDuration(activePoison.getDuration()-1);
    });

    if(eph_config.knightHealth===0){
        gameOver();
    }

    if( eph_config.activePoisons.length!=0 && eph_config.activePoisons[0].getDuration()===0){
        eph_config.activePoisons.splice(0,1);
    }

    if(eph_config.activeEnema!=null){
        eph_config.activeEnema.setDuration(eph_config.activeEnema.getDuration()-1);
        if(eph_config.activeEnema.getDuration()===0)
            eph_config.activeEnema=null;
    }
}

function postProcessMove(diceNumber){

    let grid=getGrid();
    let bombDamage=0;

    for(const movement of movements){
        const pos= new CoordinateDao(eph_config.coordinate.x + movement[0],eph_config.coordinate.y + movement[1]);

        if(0 <= pos.getX() && pos.getX() < config.game.grid.ROWS && 0 <= pos.getY() && pos.getY() < config.game.grid.COLUMNS && grid[pos.getX()][pos.getY()].getId() === config.game.id.artifact.BOMB){
            bombDamage+= Math.ceil(10*(Math.log(Math.pow(2,diceNumber))+Math.log(Math.pow(1.5,diceNumber)))/Math.pow(Math.E,1/diceNumber)  + 10/diceNumber);
            
            while(true){
                let [newCardId,newCardAttribute] = createNewCard(pos.getX(),pos.getY()); 
                if(newCardId != config.game.id.artifact.BOMB){
                    eph_config.newCardLocations.push([pos.getX()+" "+pos.getY(),newCardId,newCardAttribute]);
                    break;
                }
            }
        }
    }

    updateHealth(config.game.health.DECREASE,bombDamage);
}

function dealWeapon(weaponCard){
    eph_config.knightWeapon = new WeaponDao(weaponCard.getDamage(),weaponCard.getElement(),weaponCard.getId());
    appreciateAura(config.game.aura.INCREASE,weaponCard.getDamage());
}

function dealMonster(monsterCard){
    let monsterElement=monsterCard.getElement();
    let knightWeaponElement=null;
    let monsterHealth=monsterCard.getHealth();
    let knightWeaponDamage=0;

    if(monsterCard.getId() === config.game.id.monster.WRAITH){
        eph_config.knightWeapon=null;
        eph_config.activeEnema=null;
        eph_config.activePoisons=[];

        if(eph_config.aura >= monsterHealth){
            appreciateAura(config.game.aura.DECREASE, config.game.aura.wraith_absorption_rate.MIN_VALUE);
            eph_config.score+=monsterHealth;
        }
        else
            appreciateAura(config.game.aura.DECREASE, config.game.aura.wraith_absorption_rate.MAX_VALUE);
        return;
    }

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

    if(knightWeaponDamage<=0){
        updateHealth(config.game.health.DECREASE,Math.abs(knightWeaponDamage));
        eph_config.knightWeapon=null;
    }

    if(eph_config.knightWeapon!=null){
        eph_config.knightWeapon.setDamage(knightWeaponDamage);
    }

    if(eph_config.knightHealth <= 0){
        gameOver();
    }
    else{
        updateScore(scoreSpan);
        appreciateAura(config.game.aura.INCREASE,monsterCard.getHealth());
    }
}

function dealArtifact(artifactCard,diceNumber){

    switch(artifactCard.getId()){
        case config.game.id.artifact.BOMB:
            const damage=Math.ceil(10*(Math.log(Math.pow(2,diceNumber))+Math.log(Math.pow(1.5,diceNumber)))/Math.pow(Math.E,1/diceNumber)  + 10/diceNumber);
            updateHealth(config.game.health.DECREASE,damage);

            if(eph_config.knightHealth==0){
                gameOver();
            }

            appreciateAura(config.game.aura.INCREASE,damage);
            break;

        case config.game.id.artifact.CHAOS_ORB:
            setGrid(shuffleGrid(getGrid()));
            eph_config.shuffledGrid=mapGrid(getGrid());

            appreciateAura(config.game.aura.INCREASE,config.game.grid.ROWS * config.game.grid.COLUMNS);
            break;

        case config.game.id.artifact.ENEMA_ELIXIR:
            if(eph_config.activeEnema==null){
                const enemaBuff=Math.ceil(10*(Math.log(Math.pow(2,diceNumber)))/Math.pow(Math.E,1/diceNumber)+5/diceNumber);
                eph_config.activeEnema=new ActiveEnemaDao(enemaBuff);
                appreciateAura(config.game.aura.INCREASE,enemaBuff);
            }

            break;

        case config.game.id.artifact.HEALTH_POTION:
            const healAmount=Math.ceil(10*Math.log(Math.pow(2,diceNumber))/Math.pow(Math.E,1/diceNumber));
            updateHealth(config.game.health.INCREASE,healAmount);
            appreciateAura(config.game.aura.INCREASE,healAmount);
            
            break;

        case config.game.id.artifact.MANA_STONE:
            dealManaStone(getGrid());

            break;

        case config.game.id.artifact.POISON_POTION:
            const poisonDamage=Math.ceil(10*(Math.log(Math.pow(1.5,diceNumber)))/Math.pow(Math.E,1/diceNumber)+5/diceNumber);
            
            if(eph_config.activePoisons.length > config.game.activePoison.MAX_COUNT_OF_ACTIVE_POISON){
                console.log("print error");
            }

            eph_config.activePoisons.push(new ActivePoisonDao(poisonDamage));
            appreciateAura(config.game.aura.INCREASE,poisonDamage);

            break;

        case config.game.id.artifact.WEAPON_FORGER:
            const forgedAmount=Math.ceil(10*Math.log(Math.pow(2,diceNumber))/Math.pow(Math.E,1/diceNumber) + 10/diceNumber);

            if(eph_config.knightWeapon!=null){
                eph_config.knightWeapon.setDamage(eph_config.knightWeapon.getDamage()+forgedAmount);
                appreciateAura(config.game.aura.INCREASE,forgedAmount);
            }

            break;

        case config.game.id.artifact.MYSTERY_CHEST:
            dealArtifact(new ArtifactDao(getRandomArtifact()),diceNumber);
            
            break;

        default:
            break;
    }
}

function dealManaStone(grid){
    for(const movement of movements){
        const pos=new CoordinateDao(movement[0]+eph_config.coordinate.x,movement[1]+eph_config.coordinate.y);

        if(pos.getX() <0 || pos.getX()>=config.game.grid.ROWS || pos.getY()<0 || pos.getY()>=config.game.grid.COLUMNS){
            continue;
        }

        const monsterCard = grid[pos.getX()][pos.getY()]
        if(!(monsterCard instanceof MonsterDao))
            continue;

        updateScore(monsterCard.getHealth());
        appreciateAura(config.game.aura.INCREASE,monsterCard.getHealth());

        let [newCardId,newAttribute]=createNewCard(pos.getX(),pos.getY());
        eph_config.newCardLocations.push([pos.getX()+" "+pos.getY(),newCardId,newAttribute]);
    }
}

function gameOver(){
    console.log("GAME OVER!")
}