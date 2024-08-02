import eph_config from "../../configuration/ephemeral_config.js";
import sillyname from "sillyname";

eph_config.username=sillyname();

export const resData={
    username: eph_config.username,
    highScore: eph_config.high_score
}


