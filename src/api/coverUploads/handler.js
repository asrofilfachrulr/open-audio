const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class CoverUploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';

    this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
  }

  async postUploadCoverHandler({ params, payload }, h) {
    try {
      const { cover } = payload;
      const { id } = params;

      await this._albumsService.verifyAlbumById(id);

      if (!cover.hapi) {
        throw new ClientError('format file salah');
      }
      console.log(`cover header: ${JSON.stringify(cover.hapi.headers)}`);

      await this._validator.validateImageHeaders(cover.hapi.headers);
      const url = await this._storageService.writeFile(cover, cover.hapi);
      await this._albumsService.updateCoverURL(id, `localhost:8080/upload/${url}`);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      console.log(error);
      return new InternalServerError(this._interErrMsg);
    }
  }
}

module.exports = CoverUploadsHandler;
