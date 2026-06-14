/* gridToImageMapper.js 
 *
 * This utility files maps each dao element of grid with a 
 * corressponding UI icon with image and attribute.
 */

import { ImageIconDao } from "../dao/imageIconDao.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { MonsterDao } from "../dao/monsterDao.js"
import { WeaponDao } from "../dao/weaponDao.js";
import { KnightDao } from "../dao/knightDao.js";
import eph_config from "../configuration/ephemeral_config.js";
import config from "../configuration/config.js";
import UndefinedCardException from "../exception/undefinedCardException.js";

export function mapGrid(grid) {
  let imageGrid = [];

  grid.forEach((row, i) => {
    imageGrid[i] = [];
    row.forEach((value, j) => {
      let attribute = config.game.attribute.EMPTY;
      let imageId = value.getId();

      if (value instanceof MonsterDao) {
        attribute = value.getHealth();
      } else if (value instanceof WeaponDao) {
        attribute = value.getDamage();
      } else if (value instanceof KnightDao) {
        attribute = eph_config.knightHealth;
        // Pure: pick the right sprite without mutating the DAO.
        if (eph_config.activeEnigma != null) {
          imageId = "knight_enigma";
        }
      } else if (!(value instanceof ArtifactDao)) {
        throw new UndefinedCardException(value.constructor.name, config.game.attribute.EMPTY);
      }
      imageGrid[i][j] = new ImageIconDao("/static/asset/image/" + imageId + ".png", attribute);
    });
  });

  return imageGrid;
}