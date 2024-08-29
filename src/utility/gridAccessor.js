import config from "../../configuration/config.js";
import {shuffleGrid} from "./gridShuffler.js";
import {KnightDao} from "../dao/knightDao.js";
import {WeaponDao} from "../dao/weaponDao.js";
import {ArtifactDao} from "../dao/artifactDao.js";
import {MonsterDao} from "../dao/monsterDao.js";
import Element from "../model/element.js";
import { getRandom } from "./RNG.js";
import eph_config from "../../configuration/ephemeral_config.js";
import {} from "./mageGridAccessor.js";

const ROWS=config.game.grid.ROWS;
const COLUMNS=config.game.grid.COLUMNS;

let grid=[];

export function initializeGrid(){

    let grid=[];
    let monsterSpawnCounter=config.game.spawn_rate.MONSTER;
    let weaponSpawnCounter=config.game.spawn_rate.WEAPON;

    for (let i = 0; i < ROWS; i++) {
        grid[i]=[];
        for (let j = 0; j < COLUMNS; j++) {
            if(monsterSpawnCounter>0){
                const [health,elementType,monsterId]=getRandomMonster();
                grid[i][j] = new MonsterDao(health,elementType,monsterId);
                monsterSpawnCounter--;
            }else if(weaponSpawnCounter>0){
                const [damage,elementType,weaponId]=getRandomWeapon();
                grid[i][j]=new WeaponDao(damage,elementType,weaponId);
                weaponSpawnCounter--;
            }else{
                const artifactId=getRandomArtifact();
                grid[i][j]=new ArtifactDao(artifactId);
            }
        }
    }

    grid=shuffleGrid(grid);
    grid[0][0]=new KnightDao();
    setGrid(grid);
}

export function getGrid(){
    return grid;
}

export function setGrid(newGrid){
    grid=newGrid;
}

export function getCardFromGrid(coordinate){
    return grid[coordinate.getX()][coordinate.getY()];
}

export function setCardInGrid(coordinate,card){
    grid[coordinate.getX()][coordinate.getY()]=card;
}

export function createNewCard(x,y){
    
    const randNum=getRandom(1,48);
    let cardId=config.game.attribute.EMPTY,attribute=config.game.attribute.EMPTY;

    if(randNum <= config.game.spawn_rate.MONSTER){
        const [health,elementType,monsterId]=getRandomMonster();
        grid[x][y] = new MonsterDao(health,elementType,monsterId);
        cardId=monsterId;
        attribute=health;
    }
    else if(randNum <= config.game.spawn_rate.MONSTER+config.game.spawn_rate.WEAPON){
        const [damage,elementType,weaponId]=getRandomWeapon();
        grid[x][y] =new WeaponDao(damage,elementType,weaponId);
        cardId=weaponId;
        attribute=damage;
    }
    else{
        const artifactId=getRandomArtifact();
        grid[x][y] =new ArtifactDao(artifactId);
        cardId=artifactId;
    }

    return [cardId,attribute];
}

export function getRandomArtifact(){
    let id=config.game.attribute.EMPTY,stackedNum=0;
    const randNum=getRandom(1,100);

    if(randNum <= stackedNum+config.game.spawn_rate.artifacts_spawn_rate.CHAOS_ORB){
        id=config.game.id.artifact.CHAOS_ORB;
        return id;
    }

    stackedNum+=config.game.spawn_rate.artifacts_spawn_rate.CHAOS_ORB;
    if(randNum <= stackedNum+config.game.spawn_rate.artifacts_spawn_rate.MYSTERY_CHEST){
        id=config.game.id.artifact.MYSTERY_CHEST;
        return id;
    }

    stackedNum+=config.game.spawn_rate.artifacts_spawn_rate.MYSTERY_CHEST;
    if(randNum <= stackedNum+config.game.spawn_rate.artifacts_spawn_rate.MANA_STONE){
        id=config.game.id.artifact.MANA_STONE;
        return id;
    }

    stackedNum+=config.game.spawn_rate.artifacts_spawn_rate.MANA_STONE;
    if(randNum <= stackedNum+config.game.spawn_rate.artifacts_spawn_rate.ENIGMA_ELIXIR){
        id=config.game.id.artifact.ENEMA_ELIXIR;
        return id;
    }

    stackedNum+=config.game.spawn_rate.artifacts_spawn_rate.ENIGMA_ELIXIR;
    if(randNum <= stackedNum+config.game.spawn_rate.artifacts_spawn_rate.POISON_POTION){
        id=config.game.id.artifact.MIXED_POTION;
    }

    stackedNum+=config.game.spawn_rate.artifacts_spawn_rate.POISON_POTION;
    if(randNum <= stackedNum+config.game.spawn_rate.artifacts_spawn_rate.BOMB){
        id=config.game.id.artifact.BOMB;
        return id;
    }

    stackedNum+=config.game.spawn_rate.artifacts_spawn_rate.BOMB;
    if(randNum <= stackedNum+config.game.spawn_rate.artifacts_spawn_rate.WEAPON_FORGER){
        id=config.game.id.artifact.WEAPON_FORGER;
        return id;
    }

    id=config.game.id.artifact.MIXED_POTION;
    return id;   
}

function getRandomMonster(){

    let health=0,elementType=null,id=config.game.attribute.EMPTY;

    if(getRandom(1,100) <= config.game.spawn_rate.monsters_spawn_rate.WRAITH_MONSTER){
        id=config.game.id.monster.WRAITH;
        health=getRandom(config.game.aura.AURA_THRESHOLD_1,config.game.aura.AURA_THRESHOLD_2);
        
        return [health,elementType,id];
    }

    if(getRandom(1,100) <= config.game.spawn_rate.monsters_spawn_rate.COMMON_MONSTER){

        health=getRandom(config.game.attribute.common_monster.MIN_VALUE,config.game.attribute.common_monster.MAX_VALUE);
        
        switch(getRandom(1,config.game.count.COMMON_MONSTER)){
            case 1: id=config.game.id.monster.GOBLIN;
                    break;
            case 2: id=config.game.id.monster.GOLEM;
                    break;
            case 3: id=config.game.id.monster.SKELETON;
                    break;
            case 4: id=config.game.id.monster.SLIME;
                    break;
            case 5: id=config.game.id.monster.VAMPIRE;
                    break;
            default: console.log("ERROR: error occurred while fetching id of common monster.");
        }

        return [health,elementType,id];
    }

    health=getRandom(config.game.attribute.elemental_monster.MIN_VALUE,config.game.attribute.elemental_monster.MAX_VALUE);
        
    switch(getRandom(1,config.game.count.ELEMENTAL_MONSTER)){
        case 1: id=config.game.id.monster.DRAGON;
                elementType=Element.AERO;
                break;
        case 2: id=config.game.id.monster.IMP;
                elementType=Element.PYRO
                break;
        case 3: id=config.game.id.monster.ORC;
                elementType=Element.ELECTRO;
                break;
        case 4: id=config.game.id.monster.SERPENT;
                elementType=Element.HYDRO;
                break;
        default: console.log("ERROR: error occurred while fetching id of elemental monster.");
    }

    return [health,elementType,id];
}

function getRandomWeapon(){
    let damage=0,elementType=null,id="";

    damage=getRandom(config.game.attribute.weapon.MIN_VALUE,config.game.attribute.weapon.MAX_VALUE);
        
        switch(getRandom(1,config.game.count.WEAPON)){
            case 1: id=config.game.id.weapon.BOW;
                    elementType=Element.AERO;
                    break;
            case 2: id=config.game.id.weapon.SWORD;
                    elementType=Element.PYRO
                    break;
            case 3: id=config.game.id.weapon.GRIMOIRE;
                    elementType=Element.ELECTRO;
                    break;
            case 4: id=config.game.id.weapon.STAFF;
                    elementType=Element.HYDRO;
                    break;
            default: console.log("ERROR: error occurred while fetching id of weapon.");
        }

        return [damage,elementType,id];
}



