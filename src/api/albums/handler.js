const fs = require('fs');
const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler({ payload }, h) {
    try {
      this._validator.validateAlbumPayload(payload);
      const albumId = await this._service.addAlbum(payload);

      const response = h.response({
        status: 'success',
        data: {
          albumId,
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

  async getAlbumByIdHandler({ params }) {
    try {
      const { id } = params;
      const album = await this._service.getAlbumById(id);

      return {
        status: 'success',
        data: {
          album,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError(this._interErrMsg);
    }
  }

  async putAlbumByIdHandler({ payload, params }) {
    try {
      this._validator.validateAlbumPayload(payload);
      const { id } = params;

      await this._service.updateAlbumById(id, payload);

      return {
        status: 'success',
        message: `Album ${id} berhasil diperbarui`,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError(this._interErrMsg);
    }
  }

  async deleteAlbumByIdHandler({ params }) {
    try {
      const { id } = params;
      const album = await this._service.getOnlyAlbumById(id);

      if (album.cover) {
        await fs.unlink(`${__dirname}/../coverUploads/file/${album.cover.split('/')[4]}`, (err) => {
          if (err) console.log(err);
        });
      }
      await this._service.removeAlbumById(id);

      return {
        status: 'success',
        message: `Album ${id} berhasil dihapus`,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      console.log(error);
      return new InternalServerError(this._interErrMsg);
    }
  }
}

module.exports = AlbumsHandler;
