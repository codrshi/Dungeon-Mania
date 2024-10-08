import config from "../../configuration/config.js";
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