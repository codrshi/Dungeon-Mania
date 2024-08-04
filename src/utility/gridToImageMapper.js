import {ImageIconDao} from "../dao/imageIconDao.js";
import {ArtifactDao} from "../dao/artifactDao.js";
import {MonsterDao} from "../dao/monsterDao.js"
import {WeaponDao} from "../dao/weaponDao.js";
import { KnightDao } from "../dao/knightDao.js";
import eph_config from "../../configuration/ephemeral_config.js";

export function mapGrid(grid){
    let imageGrid=[];

    grid.forEach((row, i) => {
        imageGrid[i]=[];
        row.forEach((value, j) => {
          let attribute="";
          if(value instanceof MonsterDao)
            attribute=value.getHealth();
          else if(value instanceof WeaponDao)
            attribute=value.getDamage();
          else if(value instanceof KnightDao)
            attribute=eph_config.knightHealth;
          imageGrid[i][j] = new ImageIconDao("/static/asset/image/"+value.getId()+".png",attribute);
        });
      });

    return imageGrid;
}