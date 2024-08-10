import config from "../../configuration/config.js";
import {ActiveEnema} from "../model/activeEnema.js";

export class ActiveEnemaDao{
    activeEnema;

    constructor(buff){
        this.activeEnema=new ActiveEnema(buff,config.game.ACTIVE_ENEMA_DURATION);
    }

    getBuff() {
        return this.activeEnema.buff;
    }

    setBuff(buff){
        this.activeEnema.buff=buff;
    }

    getDuration() {
        return this.activeEnema.duration;
    }

    setDuration(duration){
        this.activeEnema.duration=duration;
    }
}