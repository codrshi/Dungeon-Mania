/* artifactInteractionManager.js 
 *
 * This utility file defines a function which processes the interaction
 * of knight card with an artifact card.
 */

import eph_config from "../configuration/ephemeral_config.js";
import {
    getGrid,
    setGrid,
    createNewCard,
    getRandomArtifact,
    getCardFromGrid,
} from "../utility/gridAccessor.js";
import { mapGrid } from "../utility/gridToImageMapper.js";
import { getRandom } from "../utility/RNG.js";
import config from "../configuration/config.js";
import { MonsterDao } from "../dao/monsterDao.js";
import { updateScore } from "../utility/scoreUpdater.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { shuffleGrid } from "../utility/gridShuffler.js";
import { CoordinateDao } from "../dao/coordinateDao.js";
import { ActivePoisonDao } from "../dao/activePoisonDao.js";
import { ActiveEnigmaDao } from "../dao/activeEnigmaDao.js";
import { updateHealth } from "../utility/healthUpdater.js";
import { appreciateAura } from "../utility/auraAppreciator.js";
import { terminateGame } from "../utility/terminateGameUtility.js";
import temp_stats_config from "../configuration/temp_stats_config.js";
import { biMaps } from "../utility/keyIndexBiMap.js";
import { logger } from "../utility/loggerService.js";
import UndefinedCardException from "../exception/undefinedCardException.js";
import { computeBombDamage } from "../utility/bombFormula.js";

const loggingLevel = config.app.loggingLevel;

export function dealArtifact(artifactCard, diceNumber, movements) {
    let tempVar = eph_config.knightHealth;
    temp_stats_config.artifactStats.totalArtifactsPicked += 1;

    logger(loggingLevel.DEBUG, "dealing artifact id = {0}, diceNumber = {1}.", artifactCard.getId(), diceNumber);

    if (artifactCard.getId() !== config.game.id.artifact.OPEN_DOOR)
        temp_stats_config.artifactStats.artifactUsage[
            biMaps.artifactIndexBiMap.getIndex(artifactCard.getId())
        ] += 1;

    // For Mystery Chest we let the rolled artifact push its own sound, so we
    // don't double up. All other artifacts push their own pickup sound here.
    if (artifactCard.getId() !== config.game.id.artifact.MYSTERY_CHEST) {
        eph_config.audioList.push(artifactCard.getId());
    }

    switch (artifactCard.getId()) {
        case config.game.id.artifact.BOMB:
            const damage = computeBombDamage(diceNumber);
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
        case config.game.id.artifact.ENIGMA_ELIXIR:
            if (eph_config.activeEnigma == null) {
                const enigmaBuff = Math.ceil(
                    (10 * Math.log(Math.pow(2, diceNumber))) /
                    Math.pow(Math.E, 1 / diceNumber) +
                    5 / diceNumber
                );
                eph_config.activeEnigma = new ActiveEnigmaDao(enigmaBuff);
                logger(loggingLevel.DEBUG, "updated active enigma = {0}.", JSON.stringify(eph_config.activeEnigma));
                appreciateAura(config.game.aura.INCREASE, enigmaBuff);
            }
            eph_config.screenLogs.push("- obtained enigma elixir.");
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
                logger(loggingLevel.DEBUG, "weapon forger effective value = {0}, updated weapon damage = {1}.", forgedAmount, eph_config.knightWeapon.getDamage());
            } else eph_config.audioList.pop();
            break;

        case config.game.id.artifact.MYSTERY_CHEST:
            logger(loggingLevel.INFO, "mystery chest obtained.");
            // Re-roll while a Mystery Chest is drawn so we never recurse into
            // another chest; cap the attempts as a paranoid safety net.
            let nestedArtifactId = getRandomArtifact();
            for (let i = 0; i < 16 && nestedArtifactId === config.game.id.artifact.MYSTERY_CHEST; i++) {
                nestedArtifactId = getRandomArtifact();
            }
            dealArtifact(new ArtifactDao(nestedArtifactId), diceNumber, movements);

            break;
        case config.game.id.artifact.OPEN_DOOR:
            logger(loggingLevel.INFO, "knight stepped on open door.");
            terminateGame(config.game.gameStatus.WON);
            break;
        default:
            throw new UndefinedCardException(artifactCard.constructor.name, artifactCard.getId());
    }
}

function dealHealthPotion(diceNumber) {
    const healAmount = Math.ceil(
        (10 * Math.log(Math.pow(2, diceNumber))) / Math.pow(Math.E, 1 / diceNumber)
    );

    // updateHealth itself pushes the "- gained X health." screen log,
    // so we don't add a second "from health potion" message here.
    updateHealth(config.game.health.INCREASE, healAmount);
    appreciateAura(config.game.aura.INCREASE, healAmount);
}

function dealPoisonPotion(diceNumber) {
    const poisonDamage = Math.ceil(
        (10 * Math.log(Math.pow(1.5, diceNumber))) /
        Math.pow(Math.E, 1 / diceNumber) +
        5 / diceNumber
    );

    // The hard cap on active poisons is enforced in preProcessMove via
    // ExcessActivePoisonException; no per-call check is needed here.
    eph_config.activePoisons.push(new ActivePoisonDao(poisonDamage));
    appreciateAura(config.game.aura.INCREASE, poisonDamage);
    eph_config.screenLogs.push("- gained poison potion.");
    logger(loggingLevel.DEBUG, "active poison added = {0}.", JSON.stringify(eph_config.activePoisons[eph_config.activePoisons.length - 1]));
}

function dealManaStone(movements) {
    const slainNames = [];

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

            slainNames.push(monsterCard.getId().substring(8));

            let [newCardId, newAttribute] = createNewCard(pos.getX(), pos.getY());
            eph_config.newCardLocations.push({
                "coordinate": { "x": pos.getX(), "y": pos.getY() },
                "cardId": newCardId,
                "cardAttribute": newAttribute
            });
        });

    if (slainNames.length > 0) {
        eph_config.screenLogs.push(
            "- slayed monster(s) " + slainNames.join(", ") + " from mana stone."
        );
    } else {
        eph_config.screenLogs.push("- mana stone fizzled (no adjacent monsters).");
    }
}