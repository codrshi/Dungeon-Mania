/*
 * mageGridAccessor.js
 *
 * Utility for Managing the Mage Grid
 *
 * Description:
 * - This utility file provides functionality for manipulating the mage grid, 
 *   which is displayed upon entering the mage realm.
 *
 * Features:
 * - Initializes the mage grid using a predefined prototype.
 * - Retrieves a specific card from the grid.
 * - Obtains the current location of the mage within the grid.
 * - Updates the mage's location with each turn.
 * - Unlocks a random escape door within the grid.
 */

import config from "../configuration/config.js";
import { KnightDao } from "../dao/knightDao.js";
import { WeaponDao } from "../dao/weaponDao.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { MonsterDao } from "../dao/monsterDao.js";
import Element from "../model/element.js";
import { getRandom } from "./RNG.js";
import { CoordinateDao } from "../dao/coordinateDao.js";
import eph_config from "../configuration/ephemeral_config.js";
import { getCardFromGrid, setCardInGrid, setGrid } from "./gridAccessor.js";
import { logger } from "../utility/loggerService.js";

const loggingLevel = config.app.loggingLevel;
const ROWS = config.game.grid.ROWS;
const COLUMNS = config.game.grid.COLUMNS;

const weaponCoordinateSet = new Set(config.game.mageGrid.WEAPON_COORDINATES);
const healthPotionCoordinateSet = new Set(config.game.mageGrid.HEALTH_POTION_COORDINATES);
const wallCoordinateSet = new Set(config.game.mageGrid.WALL_COORDINATES);
const doorCoordinateSet = new Set(config.game.mageGrid.DOOR_COORDINATES);
const poisonPotionCoordinateSet = new Set(config.game.mageGrid.POISON_POTION_COORDINATES);

const mageCoordinateArray = Array.from(healthPotionCoordinateSet);
const doorCoordinateArray = Array.from(doorCoordinateSet);

const mageGridPrototype = createMageGridPrototype();

function createMageGridPrototype() {
    let grid = [];
    for (let i = 0; i < ROWS; i++) {
        grid[i] = [];
        for (let j = 0; j < COLUMNS; j++) {
            const key = i.toString() + j.toString();

            if (weaponCoordinateSet.has(key)) {
                switch (key) {
                    case '00': grid[i][j] = new WeaponDao(config.game.attribute.INFINTE, Element.AERO, config.game.id.weapon.CROSSBOW);
                        break;
                    case '06': grid[i][j] = new WeaponDao(config.game.attribute.INFINTE, Element.ELECTRO, config.game.id.weapon.GRIMOIRE);
                        break;
                    case '60': grid[i][j] = new WeaponDao(config.game.attribute.INFINTE, Element.HYDRO, config.game.id.weapon.STAFF);
                        break;
                    case '66': grid[i][j] = new WeaponDao(config.game.attribute.INFINTE, Element.PYRO, config.game.id.weapon.SWORD);
                        break;
                    default: break;
                }
            }
            else if (healthPotionCoordinateSet.has(key)) {
                grid[i][j] = new ArtifactDao(config.game.id.artifact.HEALTH_POTION);
            }
            else if (wallCoordinateSet.has(key)) {
                grid[i][j] = new ArtifactDao(config.game.id.artifact.WALL);
            }
            else if (doorCoordinateSet.has(key)) {
                grid[i][j] = new ArtifactDao(config.game.id.artifact.CLOSE_DOOR);
            }
            else if (poisonPotionCoordinateSet.has(key)) {
                grid[i][j] = new ArtifactDao(config.game.id.artifact.POISON_POTION);
            }
        }
    }

    return grid;
}

export function getCardFromMageGridPrototype(coordinate) {
    if (coordinate.getX() < 0 || coordinate.getX() >= ROWS || coordinate.getY() < 0 || coordinate.getY() >= COLUMNS) {
        throw new InvalidCoordinateException("unknown", JSON.stringify(new CoordinateDao(x, y)));
    }
    return mageGridPrototype[coordinate.getX()][coordinate.getY()];
}

export function initializeMageGrid() {
    logger(loggingLevel.INFO, "initializing mage grid...");

    let grid = mageGridPrototype.map(row => row.slice());

    eph_config.coordinate.x = 3;
    eph_config.coordinate.y = 3;
    grid[eph_config.coordinate.x][eph_config.coordinate.y] = new KnightDao();

    setGrid(grid);
}

function getNewMageLocation() {

    let mageCoordinate = new CoordinateDao(-1, -1);
    let randomElementForMage = null;

    do {
        let index = getRandom(0, mageCoordinateArray.length - 1);
        mageCoordinate.setX(Number(mageCoordinateArray[index][0]));
        mageCoordinate.setY(Number(mageCoordinateArray[index][1]));
    }
    while (getCardFromGrid(mageCoordinate).getId() != config.game.id.artifact.HEALTH_POTION);

    switch (getRandom(0, 3)) {
        case 0: randomElementForMage = Element.AERO;
            break;
        case 1: randomElementForMage = Element.ELECTRO;
            break;
        case 2: randomElementForMage = Element.HYDRO;
            break;
        case 3: randomElementForMage = Element.PYRO;
            break;
        default: break;
    }

    return [mageCoordinate, randomElementForMage];
}

export function updateMageLocation() {

    if (eph_config.mageCoordinate.x != eph_config.coordinate.x || eph_config.mageCoordinate.y != eph_config.coordinate.y) {
        setCardInGrid(new CoordinateDao(eph_config.mageCoordinate.x, eph_config.mageCoordinate.y), mageGridPrototype[eph_config.mageCoordinate.x][eph_config.mageCoordinate.y]);

        const cardFromMageGridPrototype = getCardFromMageGridPrototype(new CoordinateDao(eph_config.mageCoordinate.x, eph_config.mageCoordinate.y));

        if (cardFromMageGridPrototype instanceof WeaponDao)
            eph_config.newCardLocations.push({
                "coordinate": { "x": eph_config.mageCoordinate.x, "y": eph_config.mageCoordinate.y },
                "cardId": cardFromMageGridPrototype.getId(),
                "cardAttribute": cardFromMageGridPrototype.getDamage()
            });
        else
            eph_config.newCardLocations.push({
                "coordinate": { "x": eph_config.mageCoordinate.x, "y": eph_config.mageCoordinate.y },
                "cardId": cardFromMageGridPrototype.getId(),
                "cardAttribute": config.game.attribute.EMPTY
            });
    }

    const [mageCoordinate, randomElementForMage] = getNewMageLocation();
    eph_config.mageCoordinate.x = mageCoordinate.getX();
    eph_config.mageCoordinate.y = mageCoordinate.getY();
    setCardInGrid(new CoordinateDao(eph_config.mageCoordinate.x, eph_config.mageCoordinate.y), new MonsterDao(config.game.attribute.INFINTE, randomElementForMage, config.game.id.monster.MAGE + "_" + randomElementForMage));

    logger(loggingLevel.INFO, "updated mage coordinate = {0}.", JSON.stringify(eph_config.mageCoordinate));
    eph_config.newCardLocations.push({
        "coordinate": { "x": eph_config.mageCoordinate.x, "y": eph_config.mageCoordinate.y },
        "cardId": config.game.id.monster.MAGE + "_" + randomElementForMage,
        "cardAttribute": config.game.attribute.INFINTE
    });
}

export function getRandomEscapeDoorCoordinate() {
    let index = getRandom(0, doorCoordinateArray.length - 1);
    const randomEscapeDoorCoordinate = new CoordinateDao(Number(doorCoordinateArray[index][0]), Number(doorCoordinateArray[index][1]));

    if (randomEscapeDoorCoordinate.getX() < 0 || randomEscapeDoorCoordinate.getX() >= ROWS || randomEscapeDoorCoordinate.getY() < 0 || randomEscapeDoorCoordinate.getY() >= COLUMNS) {
        throw new InvalidCoordinateException("escape door coordinate", JSON.stringify(randomEscapeDoorCoordinate));
    }
    logger(loggingLevel.INFO, "new random escape door coordinate = {0}.", JSON.stringify(randomEscapeDoorCoordinate));
    return randomEscapeDoorCoordinate;
}

export function getEscapeDoorCoordinate() {

    let escapeDoorCoordinate = new CoordinateDao(-1, -1);

    doorCoordinateArray.forEach(doorCoordinateString => {
        const doorCoordinate = new CoordinateDao(Number(doorCoordinateString[0]), Number(doorCoordinateString[1]));
        if (getCardFromGrid(doorCoordinate).getId() === config.game.id.artifact.OPEN_DOOR || getCardFromGrid(doorCoordinate).getId() === config.game.id.KNIGHT)
            escapeDoorCoordinate = doorCoordinate;
    })

    return escapeDoorCoordinate;
}