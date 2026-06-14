import { ImageIcon } from "../model/imageIcon.js";

export class ImageIconDao {
    imageIcon;

    constructor(imageSource, attribute) {
        this.imageIcon = new ImageIcon(imageSource, attribute);
    }

    getImageSource() {
        return this.imageIcon.imageSource;
    }

    setImageSource(imageSource) {
        this.imageIcon.imageSource = imageSource;
    }

    getAttribute() {
        return this.imageIcon.attribute;
    }

    setAttribute(attribute) {
        this.imageIcon.attribute = attribute;
    }

    toJSON() {
        return {
            imageSource: this.imageIcon.imageSource,
            attribute: this.imageIcon.attribute,
        };
    }
}