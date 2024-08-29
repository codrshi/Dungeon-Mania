import config from "../../configuration/config.js";
import eph_config from "../../configuration/ephemeral_config.js";

export function terminateGame(gameStatus){
    eph_config.currentGameStatus = gameStatus;

    switch(gameStatus){
        case config.game.gameStatus.WON :   updateHighScore();
                                            break;
        case config.game.gameStatus.LOST:   updateHighScore();
                                            break;
        case config.game.gameStatus.CANCELLED: break;
        default: break;
    }

}

function updateHighScore(){

    if(eph_config.score > eph_config.highScore){
        eph_config.highScore = eph_config.score;
    }
}
