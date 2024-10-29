/*
 * weapon.js
 *
 * This model class represents a weapon card which can be interacted by player using knight card.
 *
 * Properties:
 * - id: Specifies a unique identifier for a particular type of weapon.
 * - element: Specifies the elemental type associated with the weapon.
 * - health: Specifies the health of the weapon.
 */

export class Weapon {
    damage;
    element;
    id;

    constructor(damage, element, id) {
        this.damage = damage;
        this.element = element;
        this.id = id;
    }
}