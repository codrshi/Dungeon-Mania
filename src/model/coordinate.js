/*
 * coordinate,js
 *
 * This model class represents the two dimensional coordinate of a card in grid.
 *
 * Properties:
 * - x: Specifies the horizontal coordinate of a card in grid. It ranges from 0 to 7 inclusive.
 * - y: Specifies the vertical coordinate of a card in grid. It ranges from 0 to 7 inclusive.
 */

export class Coordinate {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}