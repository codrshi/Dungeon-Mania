/*
 * activeEnema.js
 *
 * This model class represents an active enema elixir effect applied to the player, 
 * providing a temporary buff for the following five turns.
 *
 * Properties:
 * - buff: Specifies the intensity of the effect applied. This can include increased attack power
 *         and reduced health damage.
 * - duration: Specifies the duration (in terms of turns) after which buff expires. Its 
 *             initial value is five. 
 */

export class ActiveEnema {
    buff;
    duration;

    constructor(buff, duration) {
        this.buff = buff;
        this.duration = duration;
    }
}