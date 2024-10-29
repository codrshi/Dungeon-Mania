/* monsterInteractionManager.js 
 *
 * This utility file defines a function which processes the interaction
 * of knight card with an monster card.
 */

import eph_config from "../../configuration/ephemeral_config.js";
import { getRandom } from "../utility/RNG.js";
import config from "../../configuration/config.js";
import Element from "../model/element.js";
import { updateScore } from "../utility/scoreUpdater.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { updateHealth } from "../utility/healthUpdater.js";
import { appreciateAura } from "../utility/auraAppreciator.js";
import {
    getRandomEscapeDoorCoordinate,
} from "../utility/mageGridAccessor.js";
import temp_stats_config from "../../configuration/temp_stats_config.js";
import { logger } from "../utility/loggerService.js";

const loggingLevel = config.app.loggingLevel;

export function dealMonster(monsterCard, monsterKillingStreakMoves) {
    if (monsterCard.getId().startsWith(config.game.id.monster.MAGE)) {
        dealMageMonster(monsterCard.getElement());
        return;
    }

    let monsterElement = monsterCard.getElement();
    let monsterHealth = monsterCard.getHealth();
    let knightWeaponElement = null;
    let knightWeaponDamage = 0;

    if (monsterCard.getId() === config.game.id.monster.WRAITH) {
        eph_config.knightWeapon = null;
        eph_config.activeEnema = null;
        eph_config.activePoisons = [];

        logger(loggingLevel.INFO, "knight weapon, active enema and acitve poison(s) is reset.");

        if (eph_config.aura >= monsterHealth) {
            appreciateAura(
                config.game.aura.DECREASE,
                config.game.aura.wraith_absorption_rate.MIN_VALUE
            );
            updateScore(monsterHealth);
        } else
            appreciateAura(
                config.game.aura.DECREASE,
                config.game.aura.wraith_absorption_rate.MAX_VALUE
            );
        return;
    }

    if (eph_config.knightWeapon != null) {
        knightWeaponDamage = eph_config.knightWeapon.getDamage();
        knightWeaponElement = eph_config.knightWeapon.getElement();

        if (monsterElement == null) {
            monsterHealth = Math.ceil(
                monsterHealth / config.game.COMMON_MONSTER_DAMAGE_MULTIPLIER
            );
        } else if (
            Element.getEffectiveCounterElement(knightWeaponElement) === monsterElement
        ) {
            monsterHealth = Math.ceil(
                monsterHealth / config.game.COUNTER_WEAPON_DAMAGE_MULTIPLIER
            );
        } else if (
            Element.getIneffectiveCounterElement(knightWeaponElement) ===
            monsterElement
        ) {
            monsterHealth = Math.ceil(
                monsterHealth * config.game.COUNTER_WEAPON_DAMAGE_MULTIPLIER
            );
        }
    }

    logger(loggingLevel.INFO, "effective monster health = {0}.", monsterHealth);

    let scoreSpan = Math.min(
        monsterHealth,
        knightWeaponDamage + eph_config.knightHealth
    );
    knightWeaponDamage -= monsterHealth;

    if (knightWeaponDamage <= 0) {
        updateHealth(config.game.health.DECREASE, Math.abs(knightWeaponDamage));
        if (eph_config.knightWeapon != null) {
            eph_config.knightWeapon = null;
            eph_config.screenLogs.push("- weapon expired.");
            logger(loggingLevel.INFO, "knight weapon expired.");
        }
    }

    if (eph_config.knightWeapon != null) {
        eph_config.knightWeapon.setDamage(knightWeaponDamage);
        logger(loggingLevel.INFO, "updated knight weapon damage = {0}.", knightWeaponDamage);
    }

    if (eph_config.knightHealth > 0) {
        updateScore(scoreSpan);
        appreciateAura(config.game.aura.INCREASE, monsterCard.getHealth());

        temp_stats_config.monsterStats.totalMonstersKilled += 1;
        if (monsterCard.getElement() != null)
            temp_stats_config.monsterStats.elementalMonstersKilled += 1;
        if (
            temp_stats_config.monsterStats.strongestMonsterKilledHealth === "-" ||
            monsterHealth >
            temp_stats_config.monsterStats.strongestMonsterKilledHealth
        ) {
            temp_stats_config.monsterStats.strongestMonsterKilledHealth =
                monsterHealth;
            temp_stats_config.monsterStats.strongestMonsterKilledName = monsterCard
                .getId()
                .substring(8);
        }
        monsterKillingStreakMoves += 1;
        temp_stats_config.monsterStats.monsterKillingStreakMoves = Math.max(
            temp_stats_config.monsterStats.monsterKillingStreakMoves,
            monsterKillingStreakMoves
        );

        eph_config.audioList.push(monsterCard.getId());
        eph_config.screenLogs.push(
            "- monster " + monsterCard.getId().substring(8) + " slayed."
        );
    }
}

function dealMageMonster(monsterElement) {
    let keyDropChance = config.game.mage.KEY_DROP_CHANCE;
    const knightWeaponElement =
        eph_config.knightWeapon != null
            ? eph_config.knightWeapon.getElement()
            : null;

    if (
        knightWeaponElement != null &&
        Element.getEffectiveCounterElement(knightWeaponElement) === monsterElement
    )
        keyDropChance = config.game.mage.COUNTER_WEAPON_KEY_DROP_CHANCE;
    else if (
        knightWeaponElement != null &&
        Element.getIneffectiveCounterElement(knightWeaponElement) === monsterElement
    )
        keyDropChance = 0;

    logger(loggingLevel.INFO, "key drop chance = {0}.", keyDropChance);

    if (
        eph_config.escapeDoorCountdown == 0 &&
        getRandom(1, 100) <= keyDropChance
    ) {
        logger(loggingLevel.INFO, "knight obtained the key.");

        const randomEscapeDoorCoordinate = getRandomEscapeDoorCoordinate();
        setCardInGrid(
            randomEscapeDoorCoordinate,
            new ArtifactDao(config.game.id.artifact.OPEN_DOOR)
        );

        eph_config.newCardLocations.push({
            "coordinate": { "x": randomEscapeDoorCoordinate.getX(), "y": randomEscapeDoorCoordinate.getY() },
            "cardId": config.game.id.artifact.OPEN_DOOR,
            "cardAttribute": config.game.attribute.EMPTY
        });

        eph_config.escapeDoorCountdown = config.game.mage.DOOR_CLOSE_COUNTDOWN + 1;
        eph_config.audioList.push(config.game.id.artifact.OPEN_DOOR);
        eph_config.screenLogs.push("- escape door opened for next 5 turns.");
    }
    else {
        logger(loggingLevel.INFO, "knight failed to obtain key because escape door countdown is non-zero.\nescape door countdown = {0}.", eph_config.escapeDoorCountdown);
    }

    updateScore(eph_config.aura);
}