const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler({ payload, auth }, h) {
    try {
      this._validator.validatePlaylistPayload(payload);
      const { name } = payload;
      const { userId: ownerId } = auth.credentials;
      const playlistId = await this._service.addPlaylist(ownerId, name);

      const response = h.response({
        status: 'success',
        data: {
          playlistId,
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

  async getPlaylistsHandler({ auth }) {
    try {
      const { userId: ownerId } = auth.credentials;
      const playlists = await this._service.getPlaylists(ownerId);

      return {
        status: 'success',
        data: {
          playlists,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError(this._interErrMsg);
    }
  }

  async deletePlaylistByIdHandler({ params, auth }) {
    try {
      const { id } = params;
      const { userId: ownerId } = auth.credentials;
      await this._service.verifyPlaylistOwner(ownerId, id);
      await this._service.deletePlaylistById(id);

      return {
        status: 'success',
        message: `Album ${id} berhasil dihapus`,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError(this._interErrMsg);
    }
  }
}

module.exports = PlaylistsHandler;
