const eph_config = {
    username:"",
    highScore:0,
    coordinate: {
      x:0,
      y:0
    },
    mageCoordinate:{
      x:2,
      y:2
    },
    score:0,
    knightHealth:100,
    knightWeapon:null,
    newGrid:[],
    newCardLocations:[],
    activePoisons:[],
    activeEnema:null,
    aura:999,
    isAuraThresholdThreeCrossed:false,
    isSurvivalMode:false,
    escapeDoorCountdown:0,
    currentGameStatus:'ongoing'
  };
  
export default eph_config;