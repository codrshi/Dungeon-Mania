/*
 * monster.js
 *
 * This model class represents a monster card which can be interacted by player using knight card.
 *
 * Properties:
 * - id: Specifies a unique identifier for a particular type of monster.
 * - element: Specifies the elemental type associated with the monster.
 * - health: Specifies the health of the monster.
 */

export class Monster {
    health;
    element;
    id;

    constructor(health, element, id) {
        this.health = health;
        this.element = element;
        this.id = id;
    }
}