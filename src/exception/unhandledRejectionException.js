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