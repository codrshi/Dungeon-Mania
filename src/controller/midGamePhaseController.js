/*
 * midGamePhaseController.js 
 *
 * This file contains the logic that manages player interactions during an active game session.
 * This includes functionality for dice rolls, as well as pre- and post-interaction logic for card engagement.
 */

import eph_config from "../configuration/ephemeral_config.js";
import {
    createNewCard,
    setCardInGrid,
    getCardFromGrid,
} from "../utility/gridAccessor.js";
import { getRandom } from "../utility/RNG.js";
import config from "../configuration/config.js";
import { WeaponDao } from "../dao/weaponDao.js";
import { MonsterDao } from "../dao/monsterDao.js";
import { KnightDao } from "../dao/knightDao.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { CoordinateDao } from "../dao/coordinateDao.js";
import { updateHealth } from "../utility/healthUpdater.js";
import { appreciateAura } from "../utility/auraAppreciator.js";
import {
    getCardFromMageGridPrototype,
    getEscapeDoorCoordinate,
    updateMageLocation,
} from "../utility/mageGridAccessor.js";
import temp_stats_config from "../configuration/temp_stats_config.js";
import InvalidCoordinateException from "../exception/invalidCoordinateException.js";
import { logger } from "../utility/loggerService.js";
import ExcessActivePoisonException from "../exception/excessActivePoisonException.js";
import { dealWeapon } from "../utility/weaponInteractionManager.js";
import { dealArtifact } from "../utility/artifactInteractionManager.js";
import { dealMonster } from "../utility/monsterInteractionManager.js";

const loggingLevel = config.app.loggingLevel;
const movements = [
    [config.game.coordinate.UP_X, config.game.coordinate.UP_Y],
    [config.game.coordinate.DOWN_X, config.game.coordinate.DOWN_Y],
    [config.game.coordinate.LEFT_X, config.game.coordinate.LEFT_Y],
    [config.game.coordinate.RIGHT_X, config.game.coordinate.RIGHT_Y],
    [
        config.game.coordinate.UP_X + config.game.coordinate.LEFT_X,
        config.game.coordinate.UP_Y + config.game.coordinate.LEFT_Y,
    ],
    [
        config.game.coordinate.UP_X + config.game.coordinate.RIGHT_X,
        config.game.coordinate.UP_Y + config.game.coordinate.RIGHT_Y,
    ],
    [
        config.game.coordinate.DOWN_X + config.game.coordinate.LEFT_X,
        config.game.coordinate.DOWN_Y + config.game.coordinate.LEFT_Y,
    ],
    [
        config.game.coordinate.DOWN_X + config.game.coordinate.RIGHT_X,
        config.game.coordinate.DOWN_Y + config.game.coordinate.RIGHT_Y,
    ],
];
let tempVar = 0;
let isMonsterCard = false;
let monsterKillingStreakMoves = 0;
const ROWS = config.game.grid.ROWS;
const COLUMNS = config.game.grid.COLUMNS;

// === Dice Roll Section ===
export function rollDiceExecute() {
    logger(loggingLevel.INFO, "rolling dice...");

    const diceNumber = getRandom(1, 6);
    logger(loggingLevel.INFO, "dice number obtained = {0}.", diceNumber);

    const validNextPositions = movements
        .map(movement => {
            const validNextPosition = new CoordinateDao(
                (eph_config.coordinate.x + movement[0] * diceNumber + config.game.grid.ROWS) % config.game.grid.ROWS,
                (eph_config.coordinate.y + movement[1] * diceNumber + config.game.grid.ROWS) % config.game.grid.ROWS
            );

            const cardId = getCardFromGrid(validNextPosition).getId();
            return (cardId === config.game.id.artifact.WALL || cardId === config.game.id.artifact.CLOSE_DOOR)
                ? null
                : validNextPosition;
        })
        .filter(Boolean)
        .slice(0, eph_config.aura < config.game.aura.AURA_THRESHOLD_2 ? 4 : undefined);


    logger(loggingLevel.INFO, "valid next position(s) = {0}.", JSON.stringify(validNextPositions));
    temp_stats_config.basicStats.totalGamesMoves += 1;

    const rollDiceResData = {
        diceNumber: diceNumber,
        validNextPositions: validNextPositions,
    };

    logger(loggingLevel.INFO, "dice roll successful.");
    return rollDiceResData;
}

// === Move Processing Section ===
export function processMove(newKnightCoordinate, diceNumber) {
    logger(loggingLevel.INFO, "processing move with data :\nnewKnightCoordinate = {0}\ndice number = {1}.", newKnightCoordinate, diceNumber);
    preProcessMove();

    newKnightCoordinate = new CoordinateDao(
        newKnightCoordinate[0],
        newKnightCoordinate[1]
    );

    if (newKnightCoordinate.getX() < 0 || newKnightCoordinate.getX() >= ROWS || newKnightCoordinate.getY() < 0 || newKnightCoordinate.getY() >= COLUMNS) {
        throw new InvalidCoordinateException("knight coordinate", JSON.stringify(newKnightCoordinate));
    }

    const currCard = getCardFromGrid(newKnightCoordinate);
    let prevPosCardId = config.game.attribute.EMPTY;
    let prevPosNewAttribute = config.game.attribute.EMPTY;

    if (!eph_config.isAuraThresholdThreeCrossed)
        [prevPosCardId, prevPosNewAttribute] = createNewCard(
            eph_config.coordinate.x,
            eph_config.coordinate.y
        );
    else {
        const newCardFromMageGridPrototype = getCardFromMageGridPrototype(
            new CoordinateDao(eph_config.coordinate.x, eph_config.coordinate.y)
        );
        prevPosCardId = newCardFromMageGridPrototype.getId();

        if (newCardFromMageGridPrototype instanceof WeaponDao)
            prevPosNewAttribute = newCardFromMageGridPrototype.getDamage();

        setCardInGrid(
            new CoordinateDao(eph_config.coordinate.x, eph_config.coordinate.y),
            newCardFromMageGridPrototype
        );
    }

    logger(loggingLevel.INFO, "for previous knight coordinate = {0}, new card created with ID = {1} and attribute = {2}.", JSON.stringify(eph_config.coordinate), prevPosCardId, prevPosNewAttribute);

    setCardInGrid(newKnightCoordinate, new KnightDao());
    eph_config.coordinate.x = newKnightCoordinate.getX();
    eph_config.coordinate.y = newKnightCoordinate.getY();

    logger(loggingLevel.INFO, "current knight coordinate = {0}, interacting with the card = {1}.", JSON.stringify(eph_config.coordinate), JSON.stringify(currCard));

    if (currCard instanceof WeaponDao) {
        isMonsterCard = false;
        dealWeapon(currCard);
    } else if (currCard instanceof MonsterDao) {
        isMonsterCard = true;
        dealMonster(currCard, monsterKillingStreakMoves);
    } else if (currCard instanceof ArtifactDao) {
        isMonsterCard = false;
        dealArtifact(currCard, diceNumber, movements);
    }

    postProcessMove(diceNumber);

    const processMoveResData = {
        prevPosCardId: prevPosCardId,
        prevPosNewAttribute: prevPosNewAttribute,
        eph_config: eph_config,
    };

    return processMoveResData;
}

// === Pre Processing Section ===
function preProcessMove() {
    logger(loggingLevel.INFO, "preprocessing moves...");

    eph_config.newGrid = [];
    eph_config.newCardLocations = [];
    eph_config.screenLogs = [];
    eph_config.audioList = [];
    tempVar = eph_config.knightHealth;

    if (isMonsterCard === false) {
        monsterKillingStreakMoves = 0;
        logger(loggingLevel.INFO, "resetted monster killing streak moves to 0.");
    }

    logger(loggingLevel.INFO, "currently active poisons = {0}.", JSON.stringify(eph_config.activePoisons));

    if (eph_config.activePoisons.length > config.game.activePoison.MAX_COUNT_OF_ACTIVE_POISON) {
        throw new ExcessActivePoisonException(eph_config.activePoisons.length);
    }

    eph_config.activePoisons.forEach((activePoison, i) => {
        updateHealth(config.game.health.DECREASE, activePoison.getDamage());
        eph_config.activePoisons[i].setDuration(activePoison.getDuration() - 1);
    });

    if (tempVar - eph_config.knightHealth != 0)
        eph_config.screenLogs.push(
            "- dealt " +
            (tempVar - eph_config.knightHealth) +
            " DMG due to poison(s)."
        );

    if (
        eph_config.activePoisons.length != 0 &&
        eph_config.activePoisons[0].getDuration() === 0
    ) {
        logger(loggingLevel.INFO, "removing the expired poison = {0}.", JSON.stringify(eph_config.activePoisons[0]));
        eph_config.activePoisons.splice(0, 1);
    }

    if (eph_config.activeEnema != null) {
        eph_config.activeEnema.setDuration(
            eph_config.activeEnema.getDuration() - 1
        );
        logger(loggingLevel.INFO, "decremented enema elixir duration by 1, current duration = {0}.", eph_config.activeEnema.getDuration());

        if (eph_config.activeEnema.getDuration() === 0) {
            eph_config.activeEnema = null;
            eph_config.screenLogs.push("- enema elixir expired.");
            logger(loggingLevel.INFO, "enema elixir expired.");
        }
    }

    logger(loggingLevel.INFO, "preprocessing moves completed.");
}

// === Post Processing Section ===
function postProcessMove(diceNumber) {
    logger(loggingLevel.INFO, "postprocessing moves...");

    let bombDamage = 0;

    movements
        .map(movement => new CoordinateDao(
            eph_config.coordinate.x + movement[0],
            eph_config.coordinate.y + movement[1]
        ))
        .filter(pos =>
            0 <= pos.getX() &&
            pos.getX() < config.game.grid.ROWS &&
            0 <= pos.getY() &&
            pos.getY() < config.game.grid.COLUMNS &&
            getCardFromGrid(pos).getId() === config.game.id.artifact.BOMB
        )
        .forEach(pos => {
            logger(
                loggingLevel.INFO,
                "bomb in vicinity found:\nknight location = {0}, bomb location = {1}",
                JSON.stringify(eph_config.coordinate),
                JSON.stringify(pos)
            );

            bombDamage += Math.ceil(
                (10 * (Math.log(Math.pow(2, diceNumber)) + Math.log(Math.pow(1.5, diceNumber)))) /
                Math.pow(Math.E, 1 / diceNumber) +
                10 / diceNumber
            );

            let newCardId = config.game.id.artifact.BOMB;
            let newCardAttribute = config.game.attribute.EMPTY;

            while (newCardId === config.game.id.artifact.BOMB) {
                [newCardId, newCardAttribute] = createNewCard(pos.getX(), pos.getY());
            }

            eph_config.newCardLocations.push({
                "coordinate": { "x": pos.getX(), "y": pos.getY() },
                "cardId": newCardId,
                "cardAttribute": newCardAttribute
            });

            logger(
                loggingLevel.INFO,
                "for location = {0}, created new card with ID = {1} and attribute = {2}.",
                JSON.stringify(pos),
                newCardId,
                newCardAttribute
            );
        });


    tempVar = eph_config.knightHealth;
    updateHealth(config.game.health.DECREASE, bombDamage);
    if (tempVar - eph_config.knightHealth != 0) {
        eph_config.screenLogs.push(
            "- dealt " + (tempVar - eph_config.knightHealth) + " DMG due to bomb(s)."
        );
        eph_config.audioList.push(config.game.id.artifact.BOMB);
    }
    if (eph_config.isAuraThresholdThreeCrossed) {
        updateMageLocation();

        if (eph_config.escapeDoorCountdown > 0) {
            eph_config.escapeDoorCountdown = Math.max(
                0,
                eph_config.escapeDoorCountdown - 1
            );
            logger(loggingLevel.INFO, "decremented escape door countdown by 1, current value = {0}.", eph_config.escapeDoorCoordinate);

            if (eph_config.escapeDoorCountdown == 0) {
                const escapeDoorCoordinate = getEscapeDoorCoordinate();
                setCardInGrid(
                    escapeDoorCoordinate,
                    new ArtifactDao(config.game.id.artifact.CLOSE_DOOR)
                );
                eph_config.newCardLocations.push({
                    "coordinate": { "x": escapeDoorCoordinate.getX(), "y": escapeDoorCoordinate.getY() },
                    "cardId": config.game.id.artifact.CLOSE_DOOR,
                    "cardAttribute": config.game.attribute.EMPTY
                });
                eph_config.audioList.push(config.game.id.artifact.CLOSE_DOOR);
                eph_config.screenLogs.push("- escape door closed.");
            }
            else {
                logger(loggingLevel.WARN, "escape door countdown value is negative. It should be minimum zero.");
            }
        }

        appreciateAura(
            config.game.aura.DECREASE,
            config.game.aura.mage_absorption_rate
        );
    }

    logger(loggingLevel.INFO, "postprocessing moves completed.");
}