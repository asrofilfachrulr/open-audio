const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class PlaylistSongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistSongHandler({ payload, params, auth }, h) {
    const { userId: ownerId } = auth.credentials;
    const { id } = params;
    try {
      const { songId } = payload;
      this._validator.validatePlaylistSongPayload(payload);

      await this._service.verifyPlaylistOwner(ownerId, id);
      await this._service.addPlaylistSong(id, songId);

      const response = h.response({
        status: 'success',
        message: `berhasil menambahkan lagu di playlist ${id}`,
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

  async getPlaylistSongsHandler({ params, auth }) {
    const { userId: ownerId } = auth.credentials;
    const { id } = params;

    try {
      await this._service.verifyPlaylistOwner(ownerId, id);
      const playlists = await this._service.getPlaylistSongs(id);

      return {
        status: 'success',
        data: playlists,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError(this._interErrMsg);
    }
  }

  async deletePlaylistSongByIdHandler({ payload, params, auth }) {
    const { userId: ownerId } = auth.credentials;
    const { id } = params;
    const { songId } = payload;

    try {
      await this._validator.validatePlaylistSongPayload(songId);
      await this._service.verifyPlaylistOwner(ownerId, id);
      await this._service.deletePlaylistSongById(songId);

      return {
        status: 'success',
        message: `berhasil menghapus song ${songId} pada playlist ${id}`,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError(this._interErrMsg);
    }
  }
}

module.exports = PlaylistSongHandler;
