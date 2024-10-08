import config from "../../configuration/config.js";
import { errorMessageBuilder } from "../utility/errorMessageBuilder.js";

class InvalidCoordinateException extends Error {
    constructor(...params) {
      const errorMessage = errorMessageBuilder(config.app.errorCode[1002],...params);

      super(errorMessage);
      this.name = 'InvalidCoordinateException';

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, InvalidCoordinateException);
    }
    }
  }
  
export default InvalidCoordinateException;