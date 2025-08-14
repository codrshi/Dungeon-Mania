/*
 * ephemeral_config.js 
 *
 * This file defines the game's initial state and dynamic values that evolve throughout its lifecycle.
 * These values are intended to be mutable and will change as the game progresses.
 */

const eph_config = {
  //coordinates of knight
  coordinate: {
    x: 0,
    y: 0,
  },
  //coordinates of mage monster
  mageCoordinate: {
    x: 2,
    y: 2,
  },
  score: 0,
  knightHealth: 100,
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
  isGameCrash: false,
  screenLogs: ["- click on the dice icon to start the game."],
};

export default eph_config;