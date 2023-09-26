// extending from built in js Error class
class AppError extends Error {
  constructor(message, statusCode) {
    //by doing message call we set message property to our incoming message
    super(message);
    //this is like calling error
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // for operation check
    this.isOperational = true;

    /*
#114 About STACK TRACE AND USE IN APPERROR CLASS

    adds a stack property to the given error object that yields the stack trace at the time captureStackTrace was called. Stack traces collected through Error.captureStackTrace are immediately collected, formatted, and attached to the given error object.

    The optional constructorOpt parameter allows you to pass in a function value. When collecting the stack trace all frames above the topmost call to this function, including that call, are left out of the stack trace. This can be useful to hide implementation details that won’t be useful to the user. The usual way of defining a custom error that captures a stack trace would be:

*/

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
