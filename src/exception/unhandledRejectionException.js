/*
 * UnhandledPromiseRejectionException.js
 *
 * Custom Exception: UnhandledPromiseRejectionException
 *
 * Description:
 * - This custom exception is designed to handle and log cases of unhandled promise rejections.
 * - Extends the Error class to provide a structured way of managing rejected promises that are not caught by other means, helping maintain application stability.
 *
 * Constructor Parameters:
 * - message (String): A descriptive error message related to the promise rejection, often passed from the rejection reason.
 * - promise (Promise): The rejected promise that triggered the exception, providing context for debugging.
 *
 * Properties:
 * - name: The exception name is set to 'UnhandledPromiseRejectionException' for precise error handling and logging.
 * - promise: Stores the rejected promise to retain context about the origin of the rejection.
 * - timestamp: Automatically records the time when the rejection occurred, aiding in historical debugging and log correlation.
 *
 * Methods:
 * - logError(): Logs the error message, timestamp, and promise details to the console for debugging and tracking unhandled rejections. This is particularly useful in asynchronous environments.
 *
 */

class UnhandledPromiseRejectionException extends Error {
  constructor(message, promise) {
    super(message);
    this.name = 'UnhandledPromiseRejectionException';
    this.promise = promise;
    this.timestamp = new Date();
  }

  logError() {
    console.error(`[${this.timestamp}] ${this.name}: ${this.message}`);
    console.error('Rejected Promise:', this.promise);
  }
}

export default UnhandledPromiseRejectionException;