/*
 * activePoison,js
 *
 * This model class represents an active poison effect applied to the player, 
 * reducing player's health after each turn.
 *
 * Properties:
 * - damage: Specifies the damage amount of poison.
 * - duration: Specifies the duration (in terms of turns) after which poison expires.
 *             Its initial value is three. 
 */

export class ActivePoison {
    damage;
    duration;

    constructor(damage, duration) {
        this.damage = damage;
        this.duration = duration;
    }
}