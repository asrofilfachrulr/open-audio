class InternalServerError {
    constructor(message, statusCode = 500) {
        this.name = 'InternalServerError';
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = InternalServerError;