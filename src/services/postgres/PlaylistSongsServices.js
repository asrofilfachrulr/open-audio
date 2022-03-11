const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistSongsServices {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `plySg@${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError(`Song ${songId}} gagal ditambahkan ke playlist ${playlistId}`);
    }

    return result.rows[0].id;
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlist_songs LEFT JOIN playlists ON playlists.id = playlist_id LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Playlist ${playlistId} tidak ditemukan`);
    }
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

  async verifyPlaylistOwner(ownerId, id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE playlists.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Playlist ${id} tidak ditemukan`);
    }
    const playlist = result.rows[0];
    if (playlist.owner !== ownerId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistSongsServices;
