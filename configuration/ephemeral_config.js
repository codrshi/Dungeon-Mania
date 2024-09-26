const eph_config = {
  coordinate: {
    x: 0,
    y: 0,
  },
  mageCoordinate: {
    x: 2,
    y: 2,
  },
  score: 0,
  knightHealth: 50,
  knightWeapon: null,
  newGrid: [],
  newCardLocations: [],
  activePoisons: [],
  activeEnema: null,
  aura: 0,
  isAuraThresholdThreeCrossed: false,
  isSurvivalMode: false,
  escapeDoorCountdown: 0,
  currentGameStatus: "ongoing",
  audioList: [],
  screenLogs: ["- click on the dice icon to start the game."],
};

export default eph_config;