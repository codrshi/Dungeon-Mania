import config from "../../configuration/config.js";
import { errorMessageBuilder } from "../utility/errorMessageBuilder.js";

class UndefinedCardException extends Error {
    constructor(...params) {
      const errorMessage = errorMessageBuilder(config.app.errorCode[1004],...params);

      super(errorMessage);
      this.name = 'UndefinedCardException';

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, UndefinedCardException);
    }
    }
  }
  
export default UndefinedCardException;