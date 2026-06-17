import config from "../configuration/config.js";
import { ActiveEnigma } from "../model/activeEnigma.js";

export class ActiveEnigmaDao {
    activeEnigma;

    constructor(buff) {
        this.activeEnigma = new ActiveEnigma(buff, config.game.ACTIVE_ENIGMA_DURATION);
    }

    getBuff() {
        return this.activeEnigma.buff;
    }

    setBuff(buff) {
        this.activeEnigma.buff = buff;
    }

    getDuration() {
        return this.activeEnigma.duration;
    }

    setDuration(duration) {
        this.activeEnigma.duration = duration;
    }

    toJSON() {
        return {
            buff: this.activeEnigma.buff,
            duration: this.activeEnigma.duration,
        };
    }
}
