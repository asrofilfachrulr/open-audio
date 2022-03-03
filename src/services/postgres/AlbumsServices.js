const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class AlbumsServices {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ title, body, tags }) {
  }
}

module.exports = AlbumsServices;
