const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsServices {
  constructor(collaboratorService) {
    this._collaboratorService = collaboratorService;
    this._pool = new Pool();
  }

  async addPlaylist(ownerId, name) {
    const id = `ply@${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, ownerId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan ke database');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id INNER JOIN users ON users.id = playlists.owner WHERE playlists.owner = $1 OR collaborations.user_id = $1;',
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError(`Playlist ${id} gagal dihapus`);
    }
  }

  async verifyPlaylistOwner(userId, id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE playlists.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Playlist ${id} tidak ditemukan`);
    }
    const playlist = result.rows[0];
    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(userId, id) {
    try {
      await this.verifyPlaylistOwner(userId, id);
    } catch (error) {
      if (error.statusCode === 404) {
        throw new NotFoundError(`Playlist ${id} tidak ditemukan`);
      }
      try {
        await this._collaboratorService.verifyCollaborator(id, userId);
      } catch {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
    }
  }
}

module.exports = PlaylistsServices;
