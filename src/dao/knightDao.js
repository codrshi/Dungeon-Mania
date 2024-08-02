import {Knight} from "../model/knight.js";
import config from "../../configuration/config.js";

export class KnightDao{
    knight;

    constructor(health=config.game.MAX_HEALTH){
        this.knight=new Knight(health,config.game.id.KNIGHT);
    }

    getId() {
        return this.knight.id;
    }

    setId(id){
        this.knight.id=id;
    }

    getHealth() {
        return this.knight.health;
    }

    setId(health){
        this.knight.health=health;
    }

    getWeapon() {
        return this.knight.weapon;
    }

    setWeapon(weapon){
        this.knight.weapon=weapon;
    }
}