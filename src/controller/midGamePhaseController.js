import eph_config from "../../configuration/ephemeral_config.js";
import {
    getGrid,
    setGrid,
    createNewCard,
    getRandomArtifact,
    setCardInGrid,
    getCardFromGrid,
} from "../utility/gridAccessor.js";
import { mapGrid } from "../utility/gridToImageMapper.js";
import { getRandom } from "../utility/RNG.js";
import config from "../../configuration/config.js";
import { WeaponDao } from "../dao/weaponDao.js";
import { MonsterDao } from "../dao/monsterDao.js";
import { KnightDao } from "../dao/knightDao.js";
import Element from "../model/element.js";
import { updateScore } from "../utility/scoreUpdater.js";
import { ArtifactDao } from "../dao/artifactDao.js";
import { shuffleGrid } from "../utility/gridShuffler.js";
import { CoordinateDao } from "../dao/coordinateDao.js";
import { ActivePoisonDao } from "../dao/activePoisonDao.js";
import { ActiveEnemaDao } from "../dao/activeEnemaDao.js";
import { updateHealth } from "../utility/healthUpdater.js";
import { appreciateAura } from "../utility/auraAppreciator.js";
import { terminateGame } from "../utility/terminateGameUtility.js";
import {
    getCardFromMageGridPrototype,
    getRandomEscapeDoorCoordinate,
    getEscapeDoorCoordinate,
    updateMageLocation,
} from "../utility/mageGridAccessor.js";
import temp_stats_config from "../../configuration/temp_stats_config.js";
import { biMaps } from "../utility/keyIndexBiMap.js";
import InvalidCoordinateException from "../exception/invalidCoordinateException.js";
import { logger } from "../utility/loggerService.js";
import ExcessActivePoisonException from "../exception/excessActivePoisonException.js";
import UndefinedCardException from "../exception/undefinedCardException.js";

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

export function rollDiceExecute() {
    logger(loggingLevel.INFO, "rolling dice...");

    const diceNumber = getRandom(1, 6);
    logger(loggingLevel.INFO, "dice number obtained = {0}.",diceNumber);

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


    logger(loggingLevel.INFO, "valid next position(s) = {0}.",JSON.stringify(validNextPositions));
    temp_stats_config.basicStats.totalGamesMoves += 1;

    const rollDiceResData = {
        diceNumber: diceNumber,
        validNextPositions: validNextPositions,
    };

    logger(loggingLevel.INFO, "dice roll successful.");
    return rollDiceResData;
}

export function processMove(newKnightCoordinate, diceNumber) {
    logger(loggingLevel.INFO, "processing move with data :\nnewKnightCoordinate = {0}\ndice number = {1}.",newKnightCoordinate,diceNumber);
    preProcessMove();

    newKnightCoordinate = new CoordinateDao(
        newKnightCoordinate[0],
        newKnightCoordinate[1]
    );
    throw new InvalidCoordinateException("knight coordinate",JSON.stringify(newKnightCoordinate));
    if(newKnightCoordinate.getX() < 0 || newKnightCoordinate.getX() >= ROWS || newKnightCoordinate.getY() < 0 || newKnightCoordinate.getY() >=COLUMNS){
        throw new InvalidCoordinateException("knight coordinate",JSON.stringify(newKnightCoordinate));
    }

    const currCard = getCardFromGrid(newKnightCoordinate);
    let prevPosCardId = config.game.attribute.EMPTY,
        prevPosNewAttribute = config.game.attribute.EMPTY;

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

    logger(loggingLevel.INFO, "for previous knight coordinate = {0}, new card created with ID = {1} and attribute = {2}.",JSON.stringify(eph_config.coordinate),prevPosCardId,prevPosNewAttribute);

    setCardInGrid(newKnightCoordinate, new KnightDao());
    eph_config.coordinate.x = newKnightCoordinate.getX();
    eph_config.coordinate.y = newKnightCoordinate.getY();

    logger(loggingLevel.INFO, "current knight coordinate = {0}, interacting with the card = {1}.",JSON.stringify(eph_config.coordinate),JSON.stringify(currCard));

    if (currCard instanceof WeaponDao) {
        dealWeapon(currCard);
    } else if (currCard instanceof MonsterDao) {
        dealMonster(currCard);
    } else if (currCard instanceof ArtifactDao) {
        dealArtifact(currCard, diceNumber);
    }

    postProcessMove(diceNumber);

    const processMoveResData = {
        prevPosCardId: prevPosCardId,
        prevPosNewAttribute: prevPosNewAttribute,
        eph_config: eph_config,
    };

    return processMoveResData;
}

function preProcessMove() {
    logger(loggingLevel.INFO, "preprocessing moves...");

    eph_config.newGrid = [];
    eph_config.newCardLocations = [];
    eph_config.screenLogs = [];
    eph_config.audioList = [];
    tempVar = eph_config.knightHealth;

    if (isMonsterCard === false){
        monsterKillingStreakMoves = 0;
        logger(loggingLevel.INFO,"resetted monster killing streak moves to 0.");
    }

    logger(loggingLevel.INFO, "currently active poisons = {0}.",JSON.stringify(eph_config.activePoisons));
    
    if(eph_config.activePoisons.length >= config.game.activePoison.MAX_COUNT_OF_ACTIVE_POISON){
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
    ){
        logger(loggingLevel.INFO,"removing the expired poison = {0}.",JSON.stringify(eph_config.activePoisons[0]));
        eph_config.activePoisons.splice(0, 1);
    }

    if (eph_config.activeEnema != null) {
        eph_config.activeEnema.setDuration(
            eph_config.activeEnema.getDuration() - 1
        );
        logger(loggingLevel.INFO,"decremented enema elixir duration by 1, current duration = {0}.",eph_config.activeEnema.getDuration());
        
        if (eph_config.activeEnema.getDuration() === 0) {
            eph_config.activeEnema = null;
            eph_config.screenLogs.push("- enema elixir expired.");
            logger(loggingLevel.INFO,"enema elixir expired.");
        }
    }

    logger(loggingLevel.INFO, "preprocessing moves completed.");
}

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
                "coordinate":{"x":pos.getX(),"y":pos.getY()},
                "cardId":newCardId,
                "cardAttribute":newCardAttribute
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
            logger(loggingLevel.INFO,"decremented escape door countdown by 1, current value = {0}.",eph_config.escapeDoorCoordinate);
            
            if (eph_config.escapeDoorCountdown == 0) {
                const escapeDoorCoordinate = getEscapeDoorCoordinate();
                setCardInGrid(
                    escapeDoorCoordinate,
                    new ArtifactDao(config.game.id.artifact.CLOSE_DOOR)
                );
                eph_config.newCardLocations.push({
                    "coordinate":{"x":escapeDoorCoordinate.getX(),"y":escapeDoorCoordinate.getY()},
                    "cardId":config.game.id.artifact.CLOSE_DOOR,
                    "cardAttribute":config.game.attribute.EMPTY
                });
                eph_config.audioList.push(config.game.id.artifact.CLOSE_DOOR);
                eph_config.screenLogs.push("- escape door closed.");
            }
            else{
                logger(loggingLevel.WARN,"escape door countdown value is negative. It should be minimum zero.");
            }
        }

        appreciateAura(
            config.game.aura.DECREASE,
            config.game.aura.mage_absorption_rate
        );
    }

    logger(loggingLevel.INFO, "postprocessing moves completed.");
}

function dealWeapon(weaponCard) {
    isMonsterCard = false;
    eph_config.knightWeapon = new WeaponDao(
        weaponCard.getDamage(),
        weaponCard.getElement(),
        weaponCard.getId()
    );

    logger(loggingLevel.INFO,"knight obtained a new weapon = {0}.",JSON.stringify(weaponCard));
    appreciateAura(config.game.aura.INCREASE, weaponCard.getDamage());

    temp_stats_config.weaponStats.totalweaponsGrabbed += 1;
    if (
        temp_stats_config.weaponStats.strongestWeaponAttribute === "-" ||
        weaponCard.getDamage() >
        temp_stats_config.weaponStats.strongestWeaponAttribute
    ) {
        temp_stats_config.weaponStats.strongestWeaponAttribute =
            weaponCard.getDamage();
        temp_stats_config.weaponStats.strongestWeaponName = weaponCard
            .getId()
            .substring(7);
    }
    temp_stats_config.weaponStats.weaponUsage[
        biMaps.weaponIndexBiMap.getIndex(weaponCard.getId())
    ] += 1;

    eph_config.audioList.push(weaponCard.getId());
    eph_config.screenLogs.push(
        "- obtained weapon " + weaponCard.getId().substring(7) + "."
    );
}

function dealMonster(monsterCard) {
    isMonsterCard = true;
    if (monsterCard.getId().startsWith(config.game.id.monster.MAGE)) {
        dealMageMonster(monsterCard.getElement());
        return;
    }

    let monsterElement = monsterCard.getElement();
    let monsterHealth = monsterCard.getHealth();
    let knightWeaponElement = null;
    let knightWeaponDamage = 0;

    if (monsterCard.getId() === config.game.id.monster.WRAITH) {
        eph_config.knightWeapon = null;
        eph_config.activeEnema = null;
        eph_config.activePoisons = [];
        
        logger(loggingLevel.INFO,"knight weapon, active enema and acitve poison(s) is reset.");

        if (eph_config.aura >= monsterHealth) {
            appreciateAura(
                config.game.aura.DECREASE,
                config.game.aura.wraith_absorption_rate.MIN_VALUE
            );
            updateScore(monsterHealth);
        } else
            appreciateAura(
                config.game.aura.DECREASE,
                config.game.aura.wraith_absorption_rate.MAX_VALUE
            );
        return;
    }

    if (eph_config.knightWeapon != null) {
        knightWeaponDamage = eph_config.knightWeapon.getDamage();
        knightWeaponElement = eph_config.knightWeapon.getElement();

        if (monsterElement == null) {
            monsterHealth = Math.ceil(
                monsterHealth / config.game.COMMON_MONSTER_DAMAGE_MULTIPLIER
            );
        } else if (
            Element.getEffectiveCounterElement(knightWeaponElement) === monsterElement
        ) {
            monsterHealth = Math.ceil(
                monsterHealth / config.game.COUNTER_WEAPON_DAMAGE_MULTIPLIER
            );
        } else if (
            Element.getIneffectiveCounterElement(knightWeaponElement) ===
            monsterElement
        ) {
            monsterHealth = Math.ceil(
                monsterHealth * config.game.COUNTER_WEAPON_DAMAGE_MULTIPLIER
            );
        }
    }

    logger(loggingLevel.INFO,"effective monster health = {0}.",monsterHealth);

    let scoreSpan = Math.min(
        monsterHealth,
        knightWeaponDamage + eph_config.knightHealth
    );
    knightWeaponDamage -= monsterHealth;

    if (knightWeaponDamage <= 0) {
        updateHealth(config.game.health.DECREASE, Math.abs(knightWeaponDamage));
        if (eph_config.knightWeapon != null){
            eph_config.knightWeapon = null;
            eph_config.screenLogs.push("- weapon expired.");
            logger(loggingLevel.INFO,"knight weapon expired.");
        }
    }

    if (eph_config.knightWeapon != null) {
        eph_config.knightWeapon.setDamage(knightWeaponDamage);
        logger(loggingLevel.INFO,"updated knight weapon damage = {0}.",knightWeaponDamage);
    }

    if (eph_config.knightHealth > 0) {
        updateScore(scoreSpan);
        appreciateAura(config.game.aura.INCREASE, monsterCard.getHealth());

        temp_stats_config.monsterStats.totalMonstersKilled += 1;
        if (monsterCard.getElement() != null)
            temp_stats_config.monsterStats.elementalMonstersKilled += 1;
        if (
            temp_stats_config.monsterStats.strongestMonsterKilledHealth === "-" ||
            monsterHealth >
            temp_stats_config.monsterStats.strongestMonsterKilledHealth
        ) {
            temp_stats_config.monsterStats.strongestMonsterKilledHealth =
                monsterHealth;
            temp_stats_config.monsterStats.strongestMonsterKilledName = monsterCard
                .getId()
                .substring(8);
        }
        monsterKillingStreakMoves += 1;
        temp_stats_config.monsterStats.monsterKillingStreakMoves = Math.max(
            temp_stats_config.monsterStats.monsterKillingStreakMoves,
            monsterKillingStreakMoves
        );

        eph_config.audioList.push(monsterCard.getId());
        eph_config.screenLogs.push(
            "- monster " + monsterCard.getId().substring(8) + " slayed."
        );
    }
}

function dealMageMonster(monsterElement) {
    let keyDropChance = config.game.mage.KEY_DROP_CHANCE;
    const knightWeaponElement =
        eph_config.knightWeapon != null
            ? eph_config.knightWeapon.getElement()
            : null;

    if (
        knightWeaponElement != null &&
        Element.getEffectiveCounterElement(knightWeaponElement) === monsterElement
    )
        keyDropChance = config.game.mage.COUNTER_WEAPON_KEY_DROP_CHANCE;
    else if (
        knightWeaponElement != null &&
        Element.getIneffectiveCounterElement(knightWeaponElement) === monsterElement
    )
        keyDropChance = 0;

    logger(loggingLevel.INFO,"key drop chance = {0}.",keyDropChance);

    if (
        eph_config.escapeDoorCountdown == 0 &&
        getRandom(1, 100) <= keyDropChance
    ) {
        logger(loggingLevel.INFO,"knight obtained the key.");

        const randomEscapeDoorCoordinate = getRandomEscapeDoorCoordinate();
        setCardInGrid(
            randomEscapeDoorCoordinate,
            new ArtifactDao(config.game.id.artifact.OPEN_DOOR)
        );

        eph_config.newCardLocations.push({
            "coordinate":{"x":randomEscapeDoorCoordinate.getX(),"y":randomEscapeDoorCoordinate.getY()},
            "cardId":config.game.id.artifact.OPEN_DOOR,
            "cardAttribute":config.game.attribute.EMPTY
        });

        eph_config.escapeDoorCountdown = config.game.mage.DOOR_CLOSE_COUNTDOWN + 1;
        eph_config.audioList.push(config.game.id.artifact.OPEN_DOOR);
        eph_config.screenLogs.push("- escape door opened for next 5 turns.");
    }
    else{
        logger(loggingLevel.INFO,"knight failed to obtain key because escape door countdown is non-zero.\nescape door countdown = {0}.",eph_config.escapeDoorCountdown);
    }

    updateScore(eph_config.aura);
}

function dealArtifact(artifactCard, diceNumber) {
    isMonsterCard = false;
    tempVar = eph_config.knightHealth;
    temp_stats_config.artifactStats.totalArtifactsPicked += 1;

    if (artifactCard.getId() !== config.game.id.artifact.OPEN_DOOR)
        temp_stats_config.artifactStats.artifactUsage[
            biMaps.artifactIndexBiMap.getIndex(artifactCard.getId())
        ] += 1;

    eph_config.audioList.push(artifactCard.getId());

    switch (artifactCard.getId()) {
        case config.game.id.artifact.BOMB:
            const damage = Math.ceil(
                (10 *
                    (Math.log(Math.pow(2, diceNumber)) +
                        Math.log(Math.pow(1.5, diceNumber)))) /
                Math.pow(Math.E, 1 / diceNumber) +
                10 / diceNumber
            );
            updateHealth(config.game.health.DECREASE, damage);
            appreciateAura(config.game.aura.INCREASE, damage);
            eph_config.screenLogs.push(
                "- dealt " + (tempVar - eph_config.knightHealth) + " DMG from bomb."
            );
            break;

        case config.game.id.artifact.CHAOS_ORB:
            setGrid(shuffleGrid(getGrid()));
            eph_config.newGrid = mapGrid(getGrid());
            appreciateAura(
                config.game.aura.INCREASE,
                config.game.grid.ROWS * config.game.grid.COLUMNS
            );
            eph_config.screenLogs.push("- grid shuffled.");
            break;
        case config.game.id.artifact.ENEMA_ELIXIR:
            if (eph_config.activeEnema == null) {
                const enemaBuff = Math.ceil(
                    (10 * Math.log(Math.pow(2, diceNumber))) /
                    Math.pow(Math.E, 1 / diceNumber) +
                    5 / diceNumber
                );
                eph_config.activeEnema = new ActiveEnemaDao(enemaBuff);
                logger(loggingLevel.INFO,"updated active enema = {0}.",JSON.stringify(eph_config.activeEnema));
                appreciateAura(config.game.aura.INCREASE, enemaBuff);
            }
            eph_config.screenLogs.push("- obtained enema elixir.");
            break;
        case config.game.id.artifact.MIXED_POTION:
            if (
                getRandom(1, 100) <=
                (config.game.spawn_rate.artifacts_spawn_rate.HEALTH_POTION * 100) /
                (config.game.spawn_rate.artifacts_spawn_rate.HEALTH_POTION +
                    config.game.spawn_rate.artifacts_spawn_rate.POISON_POTION)
            )
                dealHealthPotion(diceNumber);
            else dealPoisonPotion(diceNumber);

            break;
        case config.game.id.artifact.HEALTH_POTION:
            dealHealthPotion(diceNumber);

            break;
        case config.game.id.artifact.POISON_POTION:
            dealPoisonPotion(diceNumber);

            break;
        case config.game.id.artifact.MANA_STONE:
            dealManaStone();

            break;
        case config.game.id.artifact.WEAPON_FORGER:
            const forgedAmount = Math.ceil(
                (10 * Math.log(Math.pow(2, diceNumber))) /
                Math.pow(Math.E, 1 / diceNumber) +
                10 / diceNumber
            );

            if (eph_config.knightWeapon != null) {
                eph_config.knightWeapon.setDamage(
                    eph_config.knightWeapon.getDamage() + forgedAmount
                );
                appreciateAura(config.game.aura.INCREASE, forgedAmount);
                eph_config.screenLogs.push("- weapon forged.");
                logger(loggingLevel.INFO,"weapon forger effective value = {0}, updated weapon damage = {1}.",forgedAmount,eph_config.knightWeapon.getDamage());
            } else eph_config.audioList.pop();
            break;

        case config.game.id.artifact.MYSTERY_CHEST:
            logger(loggingLevel.INFO,"mystery chest obtained.");
            dealArtifact(new ArtifactDao(getRandomArtifact()), diceNumber);

            break;
        case config.game.id.artifact.OPEN_DOOR:
            logger(loggingLevel.INFO,"knight stepped on open door.");
            terminateGame(config.game.gameStatus.WON);
        default:
            throw new UndefinedCardException(artifactCard.constructor.name,artifactCard.getId());
    }
}

function dealHealthPotion(diceNumber) {
    tempVar = eph_config.knightHealth;
    const healAmount = Math.ceil(
        (10 * Math.log(Math.pow(2, diceNumber))) / Math.pow(Math.E, 1 / diceNumber)
    );

    updateHealth(config.game.health.INCREASE, healAmount);
    appreciateAura(config.game.aura.INCREASE, healAmount);
    if (eph_config.knightHealth - tempVar != 0)
        eph_config.screenLogs.push(
            "- gained " +
            (eph_config.knightHealth - tempVar) +
            " heal from health potion"
        );
}

function dealPoisonPotion(diceNumber) {
    const poisonDamage = Math.ceil(
        (10 * Math.log(Math.pow(1.5, diceNumber))) /
        Math.pow(Math.E, 1 / diceNumber) +
        5 / diceNumber
    );

    if (
        eph_config.activePoisons.length >
        config.game.activePoison.MAX_COUNT_OF_ACTIVE_POISON
    ) {
        console.log("print error");
    }

    eph_config.activePoisons.push(new ActivePoisonDao(poisonDamage));
    appreciateAura(config.game.aura.INCREASE, poisonDamage);
    eph_config.screenLogs.push("- gained poison potion.");
    logger(loggingLevel.INFO,"active poison added = {0}.",JSON.stringify(eph_config.activePoisons[eph_config.activePoisons.length - 1]));
}

function dealManaStone() {
    let monstersNames = "";

    movements
    .map(movement => new CoordinateDao(
        movement[0] + eph_config.coordinate.x,
        movement[1] + eph_config.coordinate.y
    ))
    .filter(pos =>
        pos.getX() >= 0 &&
        pos.getX() < config.game.grid.ROWS &&
        pos.getY() >= 0 &&
        pos.getY() < config.game.grid.COLUMNS
    )
    .map(pos => ({
        pos,
        monsterCard: getCardFromGrid(pos)
    }))
    .filter(({ monsterCard }) => monsterCard instanceof MonsterDao)
    .forEach(({ pos, monsterCard }) => {
        logger(
            loggingLevel.INFO,
            "monster {0} at location {1} defeated by mana stone.",
            JSON.stringify(monsterCard),
            JSON.stringify(pos)
        );

        updateScore(monsterCard.getHealth());
        appreciateAura(config.game.aura.INCREASE, monsterCard.getHealth());

        monstersNames += monsterCard.getId().substring(8) + ",";

        let [newCardId, newAttribute] = createNewCard(pos.getX(), pos.getY());
        eph_config.newCardLocations.push({
            "coordinate": { "x": pos.getX(), "y": pos.getY() },
            "cardId": newCardId,
            "cardAttribute": newAttribute
        });
    });

    eph_config.screenLogs.push(
        "- slayed monster(s) " +
        monstersNames.substring(0, monstersNames.length - 1) +
        " from mana stone."
    );
}