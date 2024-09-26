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