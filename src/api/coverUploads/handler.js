require('dotenv').config();
const fs = require('fs');
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

      await this._validator.validateImageHeaders(cover.hapi.headers);

      const album = await this._albumsService.getOnlyAlbumById(id);

      // delete cover photo related to playlist
      if (album.cover) {
        await fs.unlink(`${__dirname}/file/${album.cover.split('/')[4]}`, (err) => {
          if (err) console.log(err);
        });
      }
      const filename = await this._storageService.writeFile(cover, cover.hapi);
      await this._albumsService.updateCoverURL(id, `http://${process.env.HOST}:${process.env.PORT}/upload/${filename}`);

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

      return new InternalServerError(this._interErrMsg);
    }
  }
}

module.exports = CoverUploadsHandler;
