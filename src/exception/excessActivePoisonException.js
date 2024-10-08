import config from "../../configuration/config.js";
import { errorMessageBuilder } from "../utility/errorMessageBuilder.js";

class ExcessActivePoisonException extends Error {
  constructor(...params) {
    const errorMessage = errorMessageBuilder(config.app.errorCode[1003], ...params);

    super(errorMessage);
    this.name = 'ExcessActivePoisonException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExcessActivePoisonException);
    }
  }
}

export default ExcessActivePoisonException;