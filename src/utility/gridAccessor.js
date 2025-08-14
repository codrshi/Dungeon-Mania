/* gridAccessor.js 
 *
 * This utility file manipulates the grid.
 *
 * It performs following task:
 * - initializes grid with random cards.
 * - provides setters and getters for a particular card or whole grid.
 * - generates a new cards for a particular location in grid.
 */

import config from "../configuration/config.js";
import { shuffleGrid } from "./gridShuffler.js";
import { KnightDao } from "../dao/knightDao.js";
import { WeaponDao } from "../dao/weaponDao.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { MonsterDao } from "../dao/monsterDao.js";
import Element from "../model/element.js";
import { getRandom } from "./RNG.js";
import { logger } from "../utility/loggerService.js";
import { } from "./mageGridAccessor.js";
import { CoordinateDao } from "../dao/coordinateDao.js";
import UndefinedCardException from "../exception/undefinedCardException.js";

const ROWS = config.game.grid.ROWS;
const COLUMNS = config.game.grid.COLUMNS;
const loggingLevel = config.app.loggingLevel;
let grid = [];

export function initializeGrid() {
    logger(loggingLevel.INFO, "initializing grid...");

    let grid = [];
    let monsterSpawnCounter = config.game.spawn_rate.MONSTER;
    let weaponSpawnCounter = config.game.spawn_rate.WEAPON;

    for (let i = 0; i < ROWS; i++) {
        grid[i] = [];
        for (let j = 0; j < COLUMNS; j++) {
            if (monsterSpawnCounter > 0) {
                const [health, elementType, monsterId] = getRandomMonster();
                grid[i][j] = new MonsterDao(health, elementType, monsterId);
                monsterSpawnCounter--;
            } else if (weaponSpawnCounter > 0) {
                const [damage, elementType, weaponId] = getRandomWeapon();
                grid[i][j] = new WeaponDao(damage, elementType, weaponId);
                weaponSpawnCounter--;
            } else {
                const artifactId = getRandomArtifact();
                grid[i][j] = new ArtifactDao(artifactId);
            }
        }
    }

    grid = shuffleGrid(grid);
    grid[0][0] = new KnightDao();
    setGrid(grid);
}

export function getGrid() {
    return grid;
}

export function setGrid(newGrid) {
    grid = newGrid;
    logger(loggingLevel.INFO, "updated grid : \n" + JSON.stringify(newGrid, null, 2));
}

export function getCardFromGrid(coordinate) {
    if (coordinate.getX() < 0 || coordinate.getX() >= ROWS || coordinate.getY() < 0 || coordinate.getY() >= COLUMNS) {
        throw new InvalidCoordinateException("unknown", JSON.stringify(coordinate));
    }
    return grid[coordinate.getX()][coordinate.getY()];
}

export function setCardInGrid(coordinate, card) {
    if (coordinate.getX() < 0 || coordinate.getX() >= ROWS || coordinate.getY() < 0 || coordinate.getY() >= COLUMNS) {
        throw new InvalidCoordinateException("unknown", JSON.stringify(coordinate));
    }
    grid[coordinate.getX()][coordinate.getY()] = card;
    logger(loggingLevel.INFO, "grid location {0} updated with new card {1}.", JSON.stringify(coordinate), JSON.stringify(card));
}

export function createNewCard(x, y) {
    if (x < 0 || x >= ROWS || y < 0 || y >= COLUMNS) {
        throw new InvalidCoordinateException("unknown", JSON.stringify(new CoordinateDao(x, y)));
    }
    const randNum = getRandom(1, 48);
    let cardId = config.game.attribute.EMPTY, attribute = config.game.attribute.EMPTY;

    if (randNum <= config.game.spawn_rate.MONSTER) {
        const [health, elementType, monsterId] = getRandomMonster();
        grid[x][y] = new MonsterDao(health, elementType, monsterId);
        cardId = monsterId;
        attribute = health;
    }
    else if (randNum <= config.game.spawn_rate.MONSTER + config.game.spawn_rate.WEAPON) {
        const [damage, elementType, weaponId] = getRandomWeapon();
        grid[x][y] = new WeaponDao(damage, elementType, weaponId);
        cardId = weaponId;
        attribute = damage;
    }
    else {
        const artifactId = getRandomArtifact();
        grid[x][y] = new ArtifactDao(artifactId);
        cardId = artifactId;
    }

    return [cardId, attribute];
}

export function getRandomArtifact() {
    let stackedNum = 0;
    const randNum = getRandom(1, 100);

    if (randNum <= stackedNum + config.game.spawn_rate.artifacts_spawn_rate.CHAOS_ORB) {
        return config.game.id.artifact.CHAOS_ORB;
    }

    stackedNum += config.game.spawn_rate.artifacts_spawn_rate.CHAOS_ORB;
    if (randNum <= stackedNum + config.game.spawn_rate.artifacts_spawn_rate.MYSTERY_CHEST) {
        return config.game.id.artifact.MYSTERY_CHEST;
    }

    stackedNum += config.game.spawn_rate.artifacts_spawn_rate.MYSTERY_CHEST;
    if (randNum <= stackedNum + config.game.spawn_rate.artifacts_spawn_rate.MANA_STONE) {
        return config.game.id.artifact.MANA_STONE;
    }

    stackedNum += config.game.spawn_rate.artifacts_spawn_rate.MANA_STONE;
    if (randNum <= stackedNum + config.game.spawn_rate.artifacts_spawn_rate.ENIGMA_ELIXIR) {
        return config.game.id.artifact.ENEMA_ELIXIR;
    }

    stackedNum += config.game.spawn_rate.artifacts_spawn_rate.ENIGMA_ELIXIR;
    if (randNum <= stackedNum + config.game.spawn_rate.artifacts_spawn_rate.POISON_POTION) {
        return config.game.id.artifact.MIXED_POTION;
    }

    stackedNum += config.game.spawn_rate.artifacts_spawn_rate.POISON_POTION;
    if (randNum <= stackedNum + config.game.spawn_rate.artifacts_spawn_rate.BOMB) {
        return config.game.id.artifact.BOMB;
    }

    stackedNum += config.game.spawn_rate.artifacts_spawn_rate.BOMB;
    if (randNum <= stackedNum + config.game.spawn_rate.artifacts_spawn_rate.WEAPON_FORGER) {
        return config.game.id.artifact.WEAPON_FORGER;
    }

    return config.game.id.artifact.MIXED_POTION;
}

function getRandomMonster() {

    let health = 0, elementType = null, id = config.game.attribute.EMPTY;

    if (getRandom(1, 100) <= config.game.spawn_rate.monsters_spawn_rate.WRAITH_MONSTER) {
        id = config.game.id.monster.WRAITH;
        health = getRandom(config.game.aura.AURA_THRESHOLD_1, config.game.aura.AURA_THRESHOLD_2);

        return [health, elementType, id];
    }

    if (getRandom(1, 100) <= config.game.spawn_rate.monsters_spawn_rate.COMMON_MONSTER) {

        health = getRandom(config.game.attribute.common_monster.MIN_VALUE, config.game.attribute.common_monster.MAX_VALUE);

        switch (getRandom(1, config.game.count.COMMON_MONSTER)) {
            case 1: id = config.game.id.monster.ZOMBIE;
                break;
            case 2: id = config.game.id.monster.GOLEM;
                break;
            case 3: id = config.game.id.monster.SKELETON;
                break;
            case 4: id = config.game.id.monster.SLIME;
                break;
            case 5: id = config.game.id.monster.VAMPIRE;
                break;
            default: throw new UndefinedCardException("MonsterDao", config.game.EMPTY);
        }

        return [health, elementType, id];
    }

    health = getRandom(config.game.attribute.elemental_monster.MIN_VALUE, config.game.attribute.elemental_monster.MAX_VALUE);

    switch (getRandom(1, config.game.count.ELEMENTAL_MONSTER)) {
        case 1: id = config.game.id.monster.DRAGON;
            elementType = Element.AERO;
            break;
        case 2: id = config.game.id.monster.IMP;
            elementType = Element.PYRO
            break;
        case 3: id = config.game.id.monster.ORC;
            elementType = Element.ELECTRO;
            break;
        case 4: id = config.game.id.monster.SERPENT;
            elementType = Element.HYDRO;
            break;
        default: throw new UndefinedCardException("MonsterDao", config.game.EMPTY);
    }

    return [health, elementType, id];
}

function getRandomWeapon() {
    let damage = 0, elementType = null, id = "";

    damage = getRandom(config.game.attribute.weapon.MIN_VALUE, config.game.attribute.weapon.MAX_VALUE);

    switch (getRandom(1, config.game.count.WEAPON)) {
        case 1: id = config.game.id.weapon.CROSSBOW;
            elementType = Element.AERO;
            break;
        case 2: id = config.game.id.weapon.SWORD;
            elementType = Element.PYRO;
            break;
        case 3: id = config.game.id.weapon.GRIMOIRE;
            elementType = Element.ELECTRO;
            break;
        case 4: id = config.game.id.weapon.STAFF;
            elementType = Element.HYDRO;
            break;
        default: throw new UndefinedCardException("WeaponDao", config.game.EMPTY);
    }
    console.log("weaponnn "+id)
    return [damage, elementType, id];
}



