import config from "../../configuration/config.js";
import {ActivePoison} from "../model/activePoison.js";

export class ActivePoisonDao{
    activePoison;

    constructor(damage){
        this.activePoison=new ActivePoison(damage,config.game.activePoison.POISON_DURATION);
    }

    getDamage() {
        return this.activePoison.damage;
    }

    setDamage(damage){
        this.activePoison.damage=damage;
    }

    getDuration() {
        return this.activePoison.duration;
    }

    setDuration(duration){
        this.activePoison.duration=duration;
    }
}