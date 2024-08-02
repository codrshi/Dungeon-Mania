import eph_config from "../../configuration/ephemeral_config.js";
import {getGrid,updateCell} from "../utility/gridAccessor.js";
import {mapGrid} from "../utility/gridToImageMapper.js";
import {getRandom} from "../utility/RNG.js";
import config from "../../configuration/config.js";

export const initResData={
    username: eph_config.username,
    grid: mapGrid(getGrid())
}

export function rollDiceExecute(){
    const diceNumber=getRandom(1,6);
    let validNextPositions=[];
    const movements=[[config.game.coordinate.UP_X,config.game.coordinate.UP_Y],
                    [config.game.coordinate.DOWN_X,config.game.coordinate.DOWN_Y],
                    [config.game.coordinate.LEFT_X,config.game.coordinate.LEFT_Y],
                    [config.game.coordinate.RIGHT_X,config.game.coordinate.RIGHT_Y],
                    [config.game.coordinate.UP_X+config.game.coordinate.LEFT_X,config.game.coordinate.UP_Y+config.game.coordinate.LEFT_Y],
                    [config.game.coordinate.UP_X+config.game.coordinate.RIGHT_X,config.game.coordinate.UP_Y+config.game.coordinate.RIGHT_Y],
                    [config.game.coordinate.DOWN_X+config.game.coordinate.LEFT_X,config.game.coordinate.DOWN_Y+config.game.coordinate.LEFT_Y],
                    [config.game.coordinate.DOWN_X+config.game.coordinate.RIGHT_X,config.game.coordinate.DOWN_Y+config.game.coordinate.RIGHT_Y]];

    for(const movement of movements) {
        validNextPositions.push([(eph_config.coordinate.x + movement[0] * diceNumber + config.game.grid.ROWS)%config.game.grid.ROWS,
                                (eph_config.coordinate.y + movement[1] * diceNumber + config.game.grid.ROWS)%config.game.grid.ROWS]);
        
        if(validNextPositions.length==4 && !eph_config.isDiagonalMovement)
            break;
    };

    const rollDiceResData={
        diceNumber: diceNumber,
        validNextPositions: validNextPositions
    };
    return rollDiceResData;
}

export function processMove(newKnightCoordinate,diceNumber){
    const processMoveResData={
        prevPosCardId: updateCell(newKnightCoordinate)
    }

    return processMoveResData;
}
