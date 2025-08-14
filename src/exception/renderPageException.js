/*
 * RenderPageException.js
 *
 * Custom Exception: RenderPageException
 *
 * Description:
 * - This custom exception is raised when there is an error during page rendering, commonly due to invalid data or rendering conflicts.
 * - Extends the base Error class, generating a structured error message with errorMessageBuilder for clear logging and debugging.
 *
 * Parameters:
 * - Accepts variable parameters, allowing for specific details about the rendering issue to be included in the error message.
 * - Constructs a detailed error message by combining the configured error code and parameters provided.
 *
 * Properties:
 * - name: Sets the exception name to 'RenderPageException' to facilitate targeted error handling.
 *
 * Stack Trace:
 * - Implements Error.captureStackTrace to provide a focused stack trace that enhances debugging, pinpointing where the rendering error originates.
 *
 */

import config from "../configuration/config.js";
import { errorMessageBuilder } from "../utility/errorMessageBuilder.js";

class RenderPageException extends Error {
  constructor(...params) {
    const errorMessage = errorMessageBuilder(config.app.errorCode[1001], ...params);

    super(errorMessage);
    this.name = 'RenderPageException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RenderPageException);
    }
  }
}

export default RenderPageException;