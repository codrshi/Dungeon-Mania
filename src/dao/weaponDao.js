import {Weapon} from "../model/weapon.js";

export class WeaponDao{
    weapon;

    constructor(damage,element,id){
        this.weapon=new Weapon(damage,element,id);
    }

    getId() {
        return this.weapon.id;
    }

    setId(id){
        this.weapon.id=id;
    }

    getDamage() {
        return this.weapon.damage;
    }

    setDamage(damage){
        this.weapon.damage=damage;
    }

    getElement() {
        return this.weapon.element;
    }

    setElement(element){
        this.weapon.element=element;
    }
}