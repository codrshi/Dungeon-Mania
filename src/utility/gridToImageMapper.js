import {ImageIconDao} from "../dao/imageIconDao.js";
import {ArtifactDao} from "../dao/artifactDao.js";
import {MonsterDao} from "../dao/monsterDao.js"
import {WeaponDao} from "../dao/weaponDao.js";

export function mapGrid(grid){
    let imageGrid=[];

    grid.forEach((row, i) => {
        imageGrid[i]=[]
        row.forEach((value, j) => {
          let attribute="";
          if(value instanceof MonsterDao)
            attribute=value.getHealth();
          else if(value instanceof WeaponDao)
            attribute=value.getDamage();
          imageGrid[i][j] = new ImageIconDao("/static/asset/image/"+value.getId()+".png",attribute);
        });
      });

    return imageGrid;
}