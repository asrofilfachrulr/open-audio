const Joi = require('joi');

const AuthPostPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const AuthPutPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const AuthDeletePayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  AuthPostPayloadSchema,
  AuthPutPayloadSchema,
  AuthDeletePayloadSchema,
};
