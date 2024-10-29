/*
 * imageIcon.js
 *
 * This model class represents the UI icon for a card in the grid.
 *
 * Properties:
 * - imageSource: Specifies the absolute path where the image is stored. It's value is
 *                in the format "/static/asset/image/{card_id}.png"
 * - attribute: Specifies the attribute of the card.
 */

export class ImageIcon {
    imageSource;
    attribute;

    constructor(imageSource, attribute) {
        this.imageSource = imageSource;
        this.attribute = attribute;
    }
}