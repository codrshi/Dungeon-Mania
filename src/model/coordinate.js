/*
 * coordinate.js
 *
 * This model class represents the two dimensional coordinate of a card in
 * the grid. With the default 7x7 grid the valid range for each axis is
 * 0..6 inclusive; in general it is 0..(grid.ROWS - 1) / 0..(grid.COLUMNS - 1).
 *
 * Properties:
 * - x: Horizontal coordinate of a card in the grid.
 * - y: Vertical coordinate of a card in the grid.
 */

export class Coordinate {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}