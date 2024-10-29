/* artifactInteractionManager.js 
 *
 * This utility file defines a function which processes the interaction
 * of knight card with an artifact card.
 */

import eph_config from "../../configuration/ephemeral_config.js";
import {
    getGrid,
    setGrid,
    createNewCard,
    getRandomArtifact,
    getCardFromGrid,
} from "../utility/gridAccessor.js";
import { mapGrid } from "../utility/gridToImageMapper.js";
import { getRandom } from "../utility/RNG.js";
import config from "../../configuration/config.js";
import { MonsterDao } from "../dao/monsterDao.js";
import { updateScore } from "../utility/scoreUpdater.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { shuffleGrid } from "../utility/gridShuffler.js";
import { CoordinateDao } from "../dao/coordinateDao.js";
import { ActivePoisonDao } from "../dao/activePoisonDao.js";
import { ActiveEnemaDao } from "../dao/activeEnemaDao.js";
import { updateHealth } from "../utility/healthUpdater.js";
import { appreciateAura } from "../utility/auraAppreciator.js";
import { terminateGame } from "../utility/terminateGameUtility.js";
import temp_stats_config from "../../configuration/temp_stats_config.js";
import { biMaps } from "../utility/keyIndexBiMap.js";
import { logger } from "../utility/loggerService.js";
import UndefinedCardException from "../exception/undefinedCardException.js";

const loggingLevel = config.app.loggingLevel;

export function dealArtifact(artifactCard, diceNumber, movements) {
    let tempVar = eph_config.knightHealth;
    temp_stats_config.artifactStats.totalArtifactsPicked += 1;

    if (artifactCard.getId() !== config.game.id.artifact.OPEN_DOOR)
        temp_stats_config.artifactStats.artifactUsage[
            biMaps.artifactIndexBiMap.getIndex(artifactCard.getId())
        ] += 1;

    eph_config.audioList.push(artifactCard.getId());

    switch (artifactCard.getId()) {
        case config.game.id.artifact.BOMB:
            const damage = Math.ceil(
                (10 *
                    (Math.log(Math.pow(2, diceNumber)) +
                        Math.log(Math.pow(1.5, diceNumber)))) /
                Math.pow(Math.E, 1 / diceNumber) +
                10 / diceNumber
            );
            updateHealth(config.game.health.DECREASE, damage);
            appreciateAura(config.game.aura.INCREASE, damage);
            eph_config.screenLogs.push(
                "- dealt " + (tempVar - eph_config.knightHealth) + " DMG from bomb."
            );
            break;

        case config.game.id.artifact.CHAOS_ORB:
            setGrid(shuffleGrid(getGrid()));
            eph_config.newGrid = mapGrid(getGrid());
            appreciateAura(
                config.game.aura.INCREASE,
                config.game.grid.ROWS * config.game.grid.COLUMNS
            );
            eph_config.screenLogs.push("- grid shuffled.");
            break;
        case config.game.id.artifact.ENEMA_ELIXIR:
            if (eph_config.activeEnema == null) {
                const enemaBuff = Math.ceil(
                    (10 * Math.log(Math.pow(2, diceNumber))) /
                    Math.pow(Math.E, 1 / diceNumber) +
                    5 / diceNumber
                );
                eph_config.activeEnema = new ActiveEnemaDao(enemaBuff);
                logger(loggingLevel.INFO, "updated active enema = {0}.", JSON.stringify(eph_config.activeEnema));
                appreciateAura(config.game.aura.INCREASE, enemaBuff);
            }
            eph_config.screenLogs.push("- obtained enema elixir.");
            break;
        case config.game.id.artifact.MIXED_POTION:
            if (
                getRandom(1, 100) <=
                (config.game.spawn_rate.artifacts_spawn_rate.HEALTH_POTION * 100) /
                (config.game.spawn_rate.artifacts_spawn_rate.HEALTH_POTION +
                    config.game.spawn_rate.artifacts_spawn_rate.POISON_POTION)
            )
                dealHealthPotion(diceNumber);
            else dealPoisonPotion(diceNumber);

            break;
        case config.game.id.artifact.HEALTH_POTION:
            dealHealthPotion(diceNumber);

            break;
        case config.game.id.artifact.POISON_POTION:
            dealPoisonPotion(diceNumber);

            break;
        case config.game.id.artifact.MANA_STONE:
            dealManaStone(movements);

            break;
        case config.game.id.artifact.WEAPON_FORGER:
            const forgedAmount = Math.ceil(
                (10 * Math.log(Math.pow(2, diceNumber))) /
                Math.pow(Math.E, 1 / diceNumber) +
                10 / diceNumber
            );

            if (eph_config.knightWeapon != null) {
                eph_config.knightWeapon.setDamage(
                    eph_config.knightWeapon.getDamage() + forgedAmount
                );
                appreciateAura(config.game.aura.INCREASE, forgedAmount);
                eph_config.screenLogs.push("- weapon forged.");
                logger(loggingLevel.INFO, "weapon forger effective value = {0}, updated weapon damage = {1}.", forgedAmount, eph_config.knightWeapon.getDamage());
            } else eph_config.audioList.pop();
            break;

        case config.game.id.artifact.MYSTERY_CHEST:
            logger(loggingLevel.INFO, "mystery chest obtained.");
            dealArtifact(new ArtifactDao(getRandomArtifact()), diceNumber);

            break;
        case config.game.id.artifact.OPEN_DOOR:
            logger(loggingLevel.INFO, "knight stepped on open door.");
            terminateGame(config.game.gameStatus.WON);
        default:
            throw new UndefinedCardException(artifactCard.constructor.name, artifactCard.getId());
    }
}

function dealHealthPotion(diceNumber) {
    let tempVar = eph_config.knightHealth;
    const healAmount = Math.ceil(
        (10 * Math.log(Math.pow(2, diceNumber))) / Math.pow(Math.E, 1 / diceNumber)
    );

    updateHealth(config.game.health.INCREASE, healAmount);
    appreciateAura(config.game.aura.INCREASE, healAmount);
    if (eph_config.knightHealth - tempVar != 0)
        eph_config.screenLogs.push(
            "- gained " +
            (eph_config.knightHealth - tempVar) +
            " heal from health potion"
        );
}

function dealPoisonPotion(diceNumber) {
    const poisonDamage = Math.ceil(
        (10 * Math.log(Math.pow(1.5, diceNumber))) /
        Math.pow(Math.E, 1 / diceNumber) +
        5 / diceNumber
    );

    if (
        eph_config.activePoisons.length >
        config.game.activePoison.MAX_COUNT_OF_ACTIVE_POISON
    ) {
        console.log("print error");
    }

    eph_config.activePoisons.push(new ActivePoisonDao(poisonDamage));
    appreciateAura(config.game.aura.INCREASE, poisonDamage);
    eph_config.screenLogs.push("- gained poison potion.");
    logger(loggingLevel.INFO, "active poison added = {0}.", JSON.stringify(eph_config.activePoisons[eph_config.activePoisons.length - 1]));
}

function dealManaStone(movements) {
    let monstersNames = "";

    movements
        .map(movement => new CoordinateDao(
            movement[0] + eph_config.coordinate.x,
            movement[1] + eph_config.coordinate.y
        ))
        .filter(pos =>
            pos.getX() >= 0 &&
            pos.getX() < config.game.grid.ROWS &&
            pos.getY() >= 0 &&
            pos.getY() < config.game.grid.COLUMNS
        )
        .map(pos => ({
            pos,
            monsterCard: getCardFromGrid(pos)
        }))
        .filter(({ monsterCard }) => monsterCard instanceof MonsterDao)
        .forEach(({ pos, monsterCard }) => {
            logger(
                loggingLevel.INFO,
                "monster {0} at location {1} defeated by mana stone.",
                JSON.stringify(monsterCard),
                JSON.stringify(pos)
            );

            updateScore(monsterCard.getHealth());
            appreciateAura(config.game.aura.INCREASE, monsterCard.getHealth());

            monstersNames += monsterCard.getId().substring(8) + ",";

            let [newCardId, newAttribute] = createNewCard(pos.getX(), pos.getY());
            eph_config.newCardLocations.push({
                "coordinate": { "x": pos.getX(), "y": pos.getY() },
                "cardId": newCardId,
                "cardAttribute": newAttribute
            });
        });

    eph_config.screenLogs.push(
        "- slayed monster(s) " +
        monstersNames.substring(0, monstersNames.length - 1) +
        " from mana stone."
    );
}