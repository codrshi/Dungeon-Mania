/*
 * element.js
 *
 * This model class represents the elemental type of a weapon or monster.
 *
 * This module exports an immutable (frozen) Element object with four primary elemental types:
 * - PYRO: Represents the fire element.
 * - HYDRO: Represents the water element.
 * - ELECTRO: Represents the electric element.
 * - AERO: Represents the air/wind element.
 * 
 * Functions:
 * - getEffectiveCounterElement(elementType): Returns the element that is most effective against the given elementType.
 * - getIneffectiveCounterElement(elementType): Returns the element that is least effective against the given elementType.
 */

const Element = Object.freeze({
    PYRO: 'pyro',
    HYDRO: 'hydro',
    ELECTRO: 'electro',
    AERO: 'aero',

    getEffectiveCounterElement: function (elementType) {
        if (elementType === this.PYRO)
            return this.AERO;
        if (elementType === this.HYDRO)
            return this.PYRO
        if (elementType === this.ELECTRO)
            return this.HYDRO
        if (elementType === this.AERO)
            return this.ELECTRO
    },

    getIneffectiveCounterElement: function (elementType) {
        if (elementType === this.PYRO)
            return this.HYDRO;
        if (elementType === this.HYDRO)
            return this.ELECTRO
        if (elementType === this.ELECTRO)
            return this.AERO
        if (elementType === this.AERO)
            return this.PYRO
    }
});

export default Element;