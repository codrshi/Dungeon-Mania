import {ImageIcon} from "../model/imageIcon.js";

export class ImageIconDao{
    imageIcon;

    constructor(imageSource,attribute){
        this.imageIcon=new ImageIcon(imageSource,attribute);
    }

    getImageSource() {
        return this.imageIcon.imageSource;
    }

    setImageSource(imageSource){
        this.imageIcon.imageSource=imageSource;
    }

    getAttribute() {
        return this.imageIcon.attribute;
    }

    setImageSource(attribute){
        this.imageIcon.attribute=attribute;
    }
}