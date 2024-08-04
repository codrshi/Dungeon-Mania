import {Knight} from "../model/knight.js";
import config from "../../configuration/config.js";

export class KnightDao{
    knight;

    constructor(){
        this.knight=new Knight(config.game.id.KNIGHT);
    }

    getId() {
        return this.knight.id;
    }

    setId(id){
        this.knight.id=id;
    }
}