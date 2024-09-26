import { Monster } from "../model/monster.js";

export class MonsterDao {
    monster;

    constructor(health, element, id) {
        this.monster = new Monster(health, element, id);
    }

    getId() {
        return this.monster.id;
    }

    setId(id) {
        this.monster.id = id;
    }

    getHealth() {
        return this.monster.health;
    }

    setId(health) {
        this.monster.health = health;
    }

    getElement() {
        return this.monster.element;
    }

    setElement(element) {
        this.monster.element = element;
    }
}