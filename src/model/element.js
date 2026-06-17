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
        switch (elementType) {
            case this.PYRO: return this.AERO;
            case this.HYDRO: return this.PYRO;
            case this.ELECTRO: return this.HYDRO;
            case this.AERO: return this.ELECTRO;
            default:
                throw new Error(`Element.getEffectiveCounterElement: unknown element type "${elementType}"`);
        }
    },

    getIneffectiveCounterElement: function (elementType) {
        switch (elementType) {
            case this.PYRO: return this.HYDRO;
            case this.HYDRO: return this.ELECTRO;
            case this.ELECTRO: return this.AERO;
            case this.AERO: return this.PYRO;
            default:
                throw new Error(`Element.getIneffectiveCounterElement: unknown element type "${elementType}"`);
        }
    }
});

export default Element;