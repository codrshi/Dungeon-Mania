/*
 * temp_stats_config.js
 *
 * This file defines the dynamic statistics of the player, which evolve throughout the course of a specific game session.
 * Upon the conclusion of the game session, the temp_stats_config is merged into stats_config.
 */

let temp_stats_config = {
    basicStats: {
        totalGamesMoves: 0,
    },
    monsterStats: {
        totalMonstersKilled: 0,
        elementalMonstersKilled: 0,
        monsterKillingStreakMoves: 0,
        strongestMonsterKilledHealth: "-",
        strongestMonsterKilledName: "-",
    },
    weaponStats: {
        totalweaponsGrabbed: 0,
        strongestWeaponName: "-",
        strongestWeaponAttribute: "-",
        weaponUsage: new Array(4).fill(0),
    },
    artifactStats: {
        totalArtifactsPicked: 0,
        artifactUsage: new Array(9).fill(0),
    },
};

export default temp_stats_config;