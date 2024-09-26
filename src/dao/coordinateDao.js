import { Coordinate } from "../model/coordinate.js";

export class CoordinateDao {
    coordinate;

    constructor(x, y) {
        this.coordinate = new Coordinate(x, y);
    }

    getX() {
        return this.coordinate.x;
    }

    setX(x) {
        this.coordinate.x = x;
    }

    getY() {
        return this.coordinate.y;
    }

    setY(y) {
        this.coordinate.y = y;
    }
}