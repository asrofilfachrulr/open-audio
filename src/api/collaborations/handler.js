const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class CollaborationsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';
  }

  async postCollaborationsHandler({ payload, auth }, h) {

  }
}

module.exports = CollaborationsHandler;
