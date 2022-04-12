const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {
  filterPerformerSongByParam,
  filterTitleSongByParam,
} = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const id = `sg@${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke database');
    }

    return result.rows[0].id;
  }

  async getSongs(params) {
    const query = {
      text: 'SELECT id, title, performer FROM songs',
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    let songs = result.rows;

    if ('title' in params) {
      songs = songs.filter((s) => filterTitleSongByParam(s, params.title));
    }
    if ('performer' in params) {
      songs = songs.filter((s) => filterPerformerSongByParam(s, params.performer));
    }

    return songs;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Lagu ${id} tidak ditemukan`);
    }

    const albumId = result.rows[0].album_id;
    delete result.rows[0].album_id;
    result.rows[0].albumId = albumId;

    return result.rows[0];
  }

  async updateSongById(id, {
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6  WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Gagal memperbarui lagu ${id}. Id tidak ditemukan`);
    }
  }

  async removeSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Lagu ${id} gagal dihapus. Id tidak ditemukan`);
    }
  }

  async verifySongId(id) {
    try {
      await this.getSongById(id);
    } catch (error) {
      throw new NotFoundError(`Lagu ${id} tidak ditemukan`);
    }
  }
}

module.exports = SongsService;
