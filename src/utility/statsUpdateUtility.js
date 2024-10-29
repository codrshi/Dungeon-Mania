/* statsUpdateUtility.js
 *
 * This utility file updates the stats_config using the temp_stats_config after game terminates.
 */

import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";
import stats_config from "../../configuration/stats_config.js";
import temp_stats_config from "../../configuration/temp_stats_config.js";
import { biMaps } from "./keyIndexBiMap.js";

export function updateStats(gameStatus) {
  stats_config.basicStats.totalScore += eph_config.score;
  if (stats_config.basicStats.highScore === "-" || eph_config.score > stats_config.basicStats.highScore) {
    stats_config.basicStats.highScore = eph_config.score;
    eph_config.screenLogs.push("- new high score achieved.")
  }

  stats_config.basicStats.totalGamesPlayed += 1;
  if (gameStatus === config.game.gameStatus.WON) {
    stats_config.basicStats.gamesWon += 1;
    if (stats_config.basicStats.lowestMovesWin === "-" || temp_stats_config.basicStats.totalGamesMoves < stats_config.basicStats.lowestMovesWin)
      stats_config.basicStats.lowestMovesWin = temp_stats_config.basicStats.totalGamesMoves;
  }

  stats_config.basicStats.totalGamesMoves += temp_stats_config.basicStats.totalGamesMoves;


  stats_config.monsterStats.totalMonstersKilled += temp_stats_config.monsterStats.totalMonstersKilled;
  stats_config.monsterStats.elementalMonstersKilled += temp_stats_config.monsterStats.elementalMonstersKilled;
  if (temp_stats_config.monsterStats.monsterKillingStreakMoves > stats_config.monsterStats.monsterKillingStreakMoves)
    stats_config.monsterStats.monsterKillingStreakMoves = temp_stats_config.monsterStats.monsterKillingStreakMoves;

  if (stats_config.monsterStats.strongestMonsterKilledHealth === "-" || temp_stats_config.monsterStats.strongestMonsterKilledHealth > stats_config.monsterStats.strongestMonsterKilledHealth) {
    stats_config.monsterStats.strongestMonsterKilledHealth = temp_stats_config.monsterStats.strongestMonsterKilledHealth;
    stats_config.monsterStats.strongestMonsterKilledName = temp_stats_config.monsterStats.strongestMonsterKilledName;
  }

  stats_config.weaponStats.totalweaponsGrabbed += temp_stats_config.weaponStats.totalweaponsGrabbed;
  if (temp_stats_config.weaponStats.strongestWeaponAttribute > stats_config.weaponStats.strongestWeaponAttribute) {
    stats_config.weaponStats.strongestWeaponAttribute = temp_stats_config.weaponStats.strongestWeaponAttribute;
    stats_config.weaponStats.strongestWeaponName = temp_stats_config.weaponStats.strongestWeaponName;
  }

  let mostUsedWeaponIndex = temp_stats_config.weaponStats.weaponUsage.reduce((maxIndex, currValue, currIndex, array) => {
    return currValue > array[maxIndex] ? currIndex : maxIndex;
  }, 0);

  if (temp_stats_config.weaponStats.weaponUsage[mostUsedWeaponIndex] != 0)
    stats_config.weaponStats.mostUsedWeaponName = biMaps.weaponIndexBiMap.getKey(mostUsedWeaponIndex).substring(7);

  stats_config.artifactStats.totalArtifactsPicked += temp_stats_config.artifactStats.totalArtifactsPicked;
  let mostUsedArtifactIndex = temp_stats_config.artifactStats.artifactUsage.reduce((maxIndex, currValue, currIndex, array) => {
    return currValue > array[maxIndex] ? currIndex : maxIndex;
  }, 0);
  let leastUsedArtifactIndex = temp_stats_config.artifactStats.artifactUsage.reduce((minIndex, currValue, currIndex, array) => {
    return currValue < array[minIndex] ? currIndex : minIndex;
  }, 0);

  if (temp_stats_config.artifactStats.artifactUsage[mostUsedArtifactIndex] != 0) {
    stats_config.artifactStats.mostPickedArtifactName = biMaps.artifactIndexBiMap.getKey(mostUsedArtifactIndex).substring(9);
    stats_config.artifactStats.leastPickedArtifactName = biMaps.artifactIndexBiMap.getKey(leastUsedArtifactIndex).substring(9);
  }
}
