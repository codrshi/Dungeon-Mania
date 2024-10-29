/*
 * InvalidCoordinateException.js
 *
 * Custom Exception: InvalidCoordinateException
 *
 * Description:
 * - This exception is triggered when an invalid or out-of-bounds coordinate is encountered during gameplay.
 * - Extends the base Error class and utilizes errorMessageBuilder for structured and informative error messaging.
 *
 * Parameters:
 * - Accepts dynamic parameters to provide context about the invalid coordinates or specific details.
 * - Constructs a clear error message using the provided error code and parameters.
 *
 * Properties:
 * - name: Sets the exception name to 'InvalidCoordinateException' for ease in identification within error handling.
 *
 * Stack Trace:
 * - Implements Error.captureStackTrace for generating a focused stack trace, aiding in debugging by clearly locating the error origin.
 *
 */

import config from "../../configuration/config.js";
import { errorMessageBuilder } from "../utility/errorMessageBuilder.js";

class InvalidCoordinateException extends Error {
  constructor(...params) {
    const errorMessage = errorMessageBuilder(config.app.errorCode[1002], ...params);

    super(errorMessage);
    this.name = 'InvalidCoordinateException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidCoordinateException);
    }
  }
}

export default InvalidCoordinateException;