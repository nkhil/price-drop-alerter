const errors = require('./errors');

class DatabaseError extends Error {
  constructor(errorCode, details = {}) {
    const error = errors[errorCode];
    const errorMessage = details.message ? details.message : error.message;

    super(errorMessage || 'Unknown Error');
    this.statusCode = error.statusCode;
    this.name = error.name;
    this.code = error.code;
    this.details = details.data ? details.data : null;
    this.message = error.message;
  }
}

module.exports = {
  DatabaseError,
};
