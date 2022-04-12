const InvariantError = require('../../exceptions/InvariantError');
const {
  AuthPostPayloadSchema,
  AuthPutPayloadSchema,
  AuthDeletePayloadSchema,
} = require('./schema');

const AuthValidator = {
  validateAuthPostPayload: (payload) => {
    const validationResult = AuthPostPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAuthPutPayload: (payload) => {
    const validationResult = AuthPutPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAuthDeletePayload: (payload) => {
    const validationResult = AuthDeletePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthValidator;
