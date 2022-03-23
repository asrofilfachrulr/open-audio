const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class PlaylistSongHandler {
  constructor(playlistSongService, activitiesService, validator) {
    this._playlistSongService = playlistSongService;
    this._activitiesService = activitiesService;
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
      await this._playlistSongService.verifySongId(songId);

      await this._playlistSongService.verifyPlaylistOwner(userId, playlistId);
      await this._playlistSongService.addPlaylistSong(playlistId, songId);
      await this._activitiesService.addActivity(playlistId, songId, userId, 'add');

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
      await this._playlistSongService.verifyPlaylistOwner(ownerId, id);
      const playlist = await this._playlistSongService.getPlaylistSongs(id);

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
      await this._playlistSongService.verifyPlaylistOwner(userId, playlistId);
      await this._playlistSongService.deletePlaylistSongById(songId);
      await this._activitiesService.addActivity(playlistId, songId, userId, 'delete');

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
