let stats_config = {
    basicStats: {
        username: "",
        totalScore: 0,
        highScore: 0,
        totalGamesPlayed: 0,
        gamesWon: 0,
        totalGamesMoves: 0,
        lowestMovesWin: "-",
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
        mostUsedWeaponName: "-",
    },
    artifactStats: {
        totalArtifactsPicked: 0,
        mostPickedArtifactName: "-",
        leastPickedArtifactName: "-",
    },
};

export default stats_config;