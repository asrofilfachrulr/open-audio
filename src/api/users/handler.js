const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler({ payload }, h) {
    try {
      this._validator.validateUserPayload(payload);
      const id = await this._service.addUser(payload);

      const response = h.response({
        status: 'success',
        data: {
          userId: id,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError(this._interErrMsg);
    }
  }
}

module.exports = UsersHandler;
