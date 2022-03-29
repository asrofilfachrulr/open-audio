const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class UserAlbumLikeHandler {
  constructor(userAlbumLikesService, albumsService) {
    this._userAlbumLikesService = userAlbumLikesService;
    this._albumsService = albumsService;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';

    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.getLikeCountHandler = this.getLikeCountHandler.bind(this);
  }

  async postLikeHandler({ auth, params }, h) {
    const { id: albumId } = params;
    const { userId } = auth.credentials;

    try {
      await this._albumsService.getOnlyAlbumById(albumId);

      let action;
      if (await this._userAlbumLikesService.getUserAlbumLikeByIds(userId, albumId)) {
        await this._userAlbumLikesService.removeUserAlbumLike(userId, albumId);
        action = 'tidak menyukai';
      } else {
        await this._userAlbumLikesService.addUserAlbumLike(userId, albumId);
        action = 'menyukai';
      }

      const response = h.response({
        status: 'success',
        message: `berhasil ${action} album ${albumId}`,
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

  async getLikeCountHandler({ params }, h) {
    try {
      const { id: albumId } = params;

      await this._albumsService.getOnlyAlbumById(albumId);
      const data = await this._userAlbumLikesService.getCountUserAlbumLike(albumId);

      const response = h.response({
        status: 'success',
        data: {
          likes: parseInt(data.count, 10),
        },
      });
      if (data.source === 'cache') {
        response.header('X-Data-Source', 'cache');
      }
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

module.exports = UserAlbumLikeHandler;
