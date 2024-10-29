/* keyIndexBiMap.js 
 * This utility file provides two bidirectional maps:
 * - weapon-to-index map.
 * - artifact-to-index map.
 * 
 * The index value starts from zero for both maps and it is mapped against IDs of weapon and artifact.
 * The maps indexes are used to track interaction with each type of artifact and weapon to- maintain stats.
 */

import config from "../../configuration/config.js";

class BiMap {
    constructor() {
        this.keyToIndex = new Map();
        this.IndexTokey = new Map();
    }

    set(key, index) {
        this.keyToIndex.set(key, index);
        this.IndexTokey.set(index, key);
    }

    getKey(index) {
        return this.IndexTokey.get(index);
    }

    getIndex(key) {
        return this.keyToIndex.get(key);
    }
}

const weaponIndexBiMap = new BiMap();
weaponIndexBiMap.set(config.game.id.weapon.SWORD, 0);
weaponIndexBiMap.set(config.game.id.weapon.CROSSBOW, 1);
weaponIndexBiMap.set(config.game.id.weapon.STAFF, 2);
weaponIndexBiMap.set(config.game.id.weapon.GRIMOIRE, 3);

const artifactIndexBiMap = new BiMap();
artifactIndexBiMap.set(config.game.id.artifact.BOMB, 0);
artifactIndexBiMap.set(config.game.id.artifact.CHAOS_ORB, 1);
artifactIndexBiMap.set(config.game.id.artifact.ENEMA_ELIXIR, 2);
artifactIndexBiMap.set(config.game.id.artifact.HEALTH_POTION, 3);
artifactIndexBiMap.set(config.game.id.artifact.MANA_STONE, 4);
artifactIndexBiMap.set(config.game.id.artifact.MIXED_POTION, 5);
artifactIndexBiMap.set(config.game.id.artifact.MYSTERY_CHEST, 6);
artifactIndexBiMap.set(config.game.id.artifact.POISON_POTION, 7);
artifactIndexBiMap.set(config.game.id.artifact.WEAPON_FORGER, 8);

export const biMaps = {
    weaponIndexBiMap: weaponIndexBiMap,
    artifactIndexBiMap: artifactIndexBiMap
}