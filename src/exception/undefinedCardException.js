/*
 * UndefinedCardException.js
 *
 * Custom Exception: UndefinedCardException
 *
 * Description:
 * - This custom exception is thrown when an attempt is made to interact with an undefined or unrecognized card in the game logic.
 * - Extends the Error class to provide a descriptive and customizable error message specific to undefined card scenarios.
 *
 * Parameters:
 * - Accepts a variable number of parameters to include specific details related to the undefined card, enhancing the clarity of error messages.
 * - Constructs an error message based on a predefined error code, along with the provided parameters for detailed logging.
 *
 * Properties:
 * - name: The exception name is set to 'UndefinedCardException' to support precise error handling and logging.
 *
 * Stack Trace:
 * - Utilizes Error.captureStackTrace to limit the trace to the relevant code path, aiding efficient debugging by isolating the context where the undefined card issue occurred.
 *
 */

import config from "../configuration/config.js";
import { errorMessageBuilder } from "../utility/errorMessageBuilder.js";

class UndefinedCardException extends Error {
  constructor(...params) {
    const errorMessage = errorMessageBuilder(config.app.errorCode[1004], ...params);

    super(errorMessage);
    this.name = 'UndefinedCardException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UndefinedCardException);
    }
  }
}

export default UndefinedCardException;