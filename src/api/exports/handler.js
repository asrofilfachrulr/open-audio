const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class ExportsHandler {
  constructor(exportProducerService, playlistsService, validator) {
    this._exportProducerService = exportProducerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler({ payload, auth, params }, h) {
    try {
      this._validator.validateExportPlaylistPayload(payload);

      const { playlistId } = params;
      const { targetEmail } = payload;

      await this._playlistsService.verifyPlaylistOwner(auth.credentials.userId, playlistId);

      const message = {
        playlistId,
        targetEmail,
      };
      await this._exportProducerService.sendMessage('export:playlist', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
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

module.exports = ExportsHandler;
