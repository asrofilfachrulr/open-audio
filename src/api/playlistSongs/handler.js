const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class PlaylistSongHandler {
  constructor(playlistSongsService, playlistSongActivitiesService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._validator = validator;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistSongHandler({ payload, params, auth }, h) {
    const { userId } = auth.credentials;
    const { id: playlistId } = params;
    try {
      const { songId } = payload;
      this._validator.validatePlaylistSongPayload(payload);
      await this._playlistSongsService.verifySongId(songId);

      await this._playlistSongsService.verifyPlaylistOwner(userId, playlistId);
      await this._playlistSongsService.addPlaylistSong(playlistId, songId);
      await this._playlistSongActivitiesService.addActivity(playlistId, songId, userId, 'add');

      const response = h.response({
        status: 'success',
        message: `berhasil menambahkan lagu di playlist ${playlistId}`,
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
      await this._playlistSongsService.verifyPlaylistOwner(ownerId, id);
      const playlist = await this._playlistSongsService.getPlaylistSongs(id);

      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError(this._interErrMsg);
    }
  }

  async deletePlaylistSongByIdHandler({ payload, params, auth }) {
    const { userId } = auth.credentials;
    const { id: playlistId } = params;
    const { songId } = payload;

    try {
      this._validator.validatePlaylistSongPayload(payload);
      await this._playlistSongsService.verifyPlaylistOwner(userId, playlistId);
      await this._playlistSongsService.deletePlaylistSongById(songId);
      await this._playlistSongActivitiesService.addActivity(playlistId, songId, userId, 'delete');

      return {
        status: 'success',
        message: `berhasil menghapus song ${songId} pada playlist ${playlistId}`,
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
