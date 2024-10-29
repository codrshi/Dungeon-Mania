/* weaponInteractionManager.js 
 *
 * This utility file defines a function which processes the interaction
 * of knight card with an weapon card.
 */

import eph_config from "../../configuration/ephemeral_config.js";
import config from "../../configuration/config.js";
import { WeaponDao } from "../dao/weaponDao.js";
import { appreciateAura } from "../utility/auraAppreciator.js";
import temp_stats_config from "../../configuration/temp_stats_config.js";
import { biMaps } from "../utility/keyIndexBiMap.js";
import { logger } from "../utility/loggerService.js";

const loggingLevel = config.app.loggingLevel;

export function dealWeapon(weaponCard) {
    eph_config.knightWeapon = new WeaponDao(
        weaponCard.getDamage(),
        weaponCard.getElement(),
        weaponCard.getId()
    );

    logger(loggingLevel.INFO, "knight obtained a new weapon = {0}.", JSON.stringify(weaponCard));
    appreciateAura(config.game.aura.INCREASE, weaponCard.getDamage());

    temp_stats_config.weaponStats.totalweaponsGrabbed += 1;
    if (
        temp_stats_config.weaponStats.strongestWeaponAttribute === "-" ||
        weaponCard.getDamage() >
        temp_stats_config.weaponStats.strongestWeaponAttribute
    ) {
        temp_stats_config.weaponStats.strongestWeaponAttribute =
            weaponCard.getDamage();
        temp_stats_config.weaponStats.strongestWeaponName = weaponCard
            .getId()
            .substring(7);
    }
    temp_stats_config.weaponStats.weaponUsage[
        biMaps.weaponIndexBiMap.getIndex(weaponCard.getId())
    ] += 1;

    eph_config.audioList.push(weaponCard.getId());
    eph_config.screenLogs.push(
        "- obtained weapon " + weaponCard.getId().substring(7) + "."
    );
}