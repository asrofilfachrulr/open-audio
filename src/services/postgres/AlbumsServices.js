const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class AlbumsServices {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `alb@${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan ke database');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const resultAlbum = await this._pool.query(queryAlbum);

    if (!resultAlbum.rowCount) {
      throw new NotFoundError(`Album ${id} tidak ditemukan`);
    }

    const querySongs = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    };
    const resultSong = await this._pool.query(querySongs);
    if (!resultSong.rowCount) {
      resultAlbum.rows[0].songs = [];
      return resultAlbum.rows[0];
    }

    resultAlbum.rows[0].songs = resultSong.rows.map(mapDBToModel);

    return resultAlbum.rows[0];
  }

  async updateAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Gagal memperbarui album ${id}. Id tidak ditemukan`);
    }
  }

  async removeAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Album ${id} gagal dihapus. Id tidak ditemukan`);
    }
  }
}

module.exports = AlbumsServices;
