/*
 * ExcessActivePoisonException.js
 *
 * Custom Exception: ExcessActivePoisonException
 *
 * Description:
 * - This exception is thrown when the game encounters a state of excessive active poison beyond allowable limit of three.
 * - It extends the base Error class and customizes the error message using the error code and parameters.
 * - The error message is constructed using errorMessageBuilder to ensure consistent and informative error reporting.
 *
 * Parameters:
 * - Accepts variable parameters that are passed to errorMessageBuilder to create a detailed, parameterized error message.
 *
 * Properties:
 * - name: Sets the exception name to 'ExcessActivePoisonException' for easy identification in error handling.
 *
 * Stack Trace:
 * - Uses Error.captureStackTrace for accurate stack trace generation, enhancing debugging by pinpointing the source of the exception.
 *
 */

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