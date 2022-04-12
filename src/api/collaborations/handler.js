const ClientError = require('../../exceptions/ClientError');
const InternalServerError = require('../../exceptions/InternalServerError');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;
    this._interErrMsg = 'Maaf, terjadi kegagalan pada server kami';
    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postCollaborationsHandler({ payload, auth }, h) {
    try {
      this._validator.validateCollaborationsPayload(payload);
      const { playlistId, userId: collaboratorId } = payload;
      const { userId: ownerId } = auth.credentials;
      await this._playlistsService.verifyPlaylistOwner(ownerId, playlistId);

      await this._usersService.getUserById(collaboratorId);

      const id = await this._collaborationsService.addCollaboration(playlistId, collaboratorId);

      const response = h.response({
        status: 'success',
        data: {
          collaborationId: id,
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

  async deleteCollaborationsHandler({ payload, auth }) {
    try {
      this._validator.validateCollaborationsPayload(payload);
      const { playlistId, userId: collaboratorId } = payload;

      const { userId: ownerId } = auth.credentials;
      await this._playlistsService.verifyPlaylistOwner(ownerId, playlistId);

      await this._collaborationsService.deleteCollaboration(playlistId, collaboratorId);

      return {
        status: 'success',
        message: `Berhasil menghapus collaboration user ${collaboratorId} pada playlist ${playlistId}`,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return error;
      }
      return new InternalServerError(this._interErrMsg);
    }
  }
}

module.exports = CollaborationsHandler;
