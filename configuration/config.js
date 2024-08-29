const config = {
  app: {
    PORT: 8080,
    url: {
      HOME_PAGE: '/',
      HOME_PAGE_EPH_CONFIG: '/index/eph-config',
      ONGOING_GAME: '/game',
      ONGOING_GAME_EPH_CONFIG: '/game/eph-config',
      ONGOING_GAME_ROLL_DICE: '/game/roll-dice',
      ONGOING_GAME_PROCESS_MOVE: '/game/process-move',
      ONGOING_GAME_EXIT: '/game/exit'
    }
  },
  game: {
    COUNTER_WEAPON_DAMAGE_MULTIPLIER: 1.5,
    COMMON_MONSTER_DAMAGE_MULTIPLIER: 2,
    gameStatus:{
      WON: 'won',
      LOST: 'lost',
      CANCELLED: 'cancelled',
      ONGOING: 'ongoing'
    },
    grid:{
      ROWS: 7,
      COLUMNS: 7
    },
    mageGrid:{
      WEAPON_COORDINATES: ['00','06','60','66'],
      HEALTH_POTION_COORDINATES: ['22','23','24','32','33','34','42','43','44'],
      WALL_COORDINATES: ['11','12','14','15','21','25','41','45','51','52','54','55'],
      DOOR_COORDINATES: ['13','31','35','53'],
      POISON_POTION_COORDINATES: ['01','02','03','04','05','10','20','30','40','50','16','26','36','46','56','61','62','63','64','65'],
    },
    mage: {
      KEY_DROP_CHANCE: 30,
      COUNTER_WEAPON_KEY_DROP_CHANCE: 50,
      DOOR_CLOSE_COUNTDOWN: 5
    },
    aura: {
      AURA_THRESHOLD_1: 400,
      AURA_THRESHOLD_2: 600,
      AURA_THRESHOLD_3: 1000,
      INCREASE: "increase_aura",
      DECREASE: "decrease_aura",
      wraith_absorption_rate:{
        MIN_VALUE:10,
        MAX_VALUE:50
      }
    },
    attribute: {
      common_monster: {
        MIN_VALUE: 10,
        MAX_VALUE: 25,
      },
      elemental_monster: {
        MIN_VALUE: 15,
        MAX_VALUE: 30,
      },
      weapon: {
        MIN_VALUE: 40,
        MAX_VALUE: 60,
      },
      health_potion: {
        MIN_VALUE: 10,
        MAX_VALUE: 20,
      },
      poison_potion: {
        MIN_VALUE: 5,
        MAX_VALUE: 10,
      },
      bomb: {
        MIN_VALUE: 15,
        MAX_VALUE: 25,
      },
      INFINTE: '∞',
      EMPTY: ''
    },
    spawn_rate: {
      MONSTER: 22,
      monsters_spawn_rate: {
        WRAITH_MONSTER: 1,
        COMMON_MONSTER: 60,
        ELEMENTAL_MONSTER: 40,
      },
      WEAPON: 10,
      ARTIFACT: 16,
      artifacts_spawn_rate: {
        HEALTH_POTION: 30,
        WEAPON_FORGER: 20,
        BOMB: 12,
        POISON_POTION: 10,
        ENIGMA_ELIXIR: 10,
        MANA_STONE: 8,
        MYSTERY_CHEST: 7,
        CHAOS_ORB: 3,
      },
    },
    count: {
      COMMON_MONSTER: 5,
      ELEMENTAL_MONSTER: 4,
      WEAPON: 4,
      ARTIFACT: 7
    },
    id:{
      KNIGHT:"knight",
      weapon:{
        BOW:"weapon_bow",
        STAFF:"weapon_staff",
        GRIMOIRE:"weapon_grimoire",
        SWORD:"weapon_sword"
      },
      monster:{
        WRAITH: "monster_wraith",
        DRAGON:"monster_dragon",
        GOBLIN:"monster_goblin",
        GOLEM:"monster_golem",
        IMP:"monster_imp",
        ORC:"monster_orc",
        SERPENT:"monster_serpent",
        SKELETON:"monster_skeleton",
        SLIME:"monster_slime",
        VAMPIRE:"monster_vampire",
        MAGE:"monster_mage"
      },
      artifact:{
        BOMB:"artifact_bomb",
        CHAOS_ORB:"artifact_chaos_orb",
        ENEMA_ELIXIR:"artifact_enema_elixir",
        HEALTH_POTION:"artifact_health_potion",
        MANA_STONE:"artifact_mana_stone",
        POISON_POTION:"artifact_poison_potion",
        WEAPON_FORGER:"artifact_weapon_forger",
        MYSTERY_CHEST:"artifact_mystery_chest",
        MIXED_POTION:"artifact_mixed_potion",
        WALL:"artifact_wall",
        CLOSE_DOOR:"artifact_close_door",
        OPEN_DOOR:"artifact_open_door"
      }
    },
    coordinate:{
      UP_X:0,
      UP_Y:-1,

      DOWN_X:0,
      DOWN_Y:1,

      LEFT_X:-1,
      LEFT_Y:0,

      RIGHT_X:1,
      RIGHT_Y:0
    },
    activePoison:{
      POISON_DURATION: 3,
      MAX_COUNT_OF_ACTIVE_POISON: 3
    },
    ACTIVE_ENEMA_DURATION: 5,
    health:{
      INCREASE: "increase health",
      DECREASE: "decrease health",
      MAX_HEALTH: 100
    }
  },
};

export default config;
