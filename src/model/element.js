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