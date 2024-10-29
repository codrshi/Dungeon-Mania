/*
 * artifact.js
 *
 * This model class represents an artifact card which can be obtained by player.
 *
 * Properties:
 * - id: Specifies the unique identifier of a particular type of artifact.
 */

export class Artifact {
    id;

    constructor(id) {
        this.id = id;
    }
}