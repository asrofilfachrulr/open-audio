const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

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
  }

  async getPlaylistSongs(playlistId) {
    const queryPlaylist = {
      text: 'SELECT DISTINCT ON (playlists.id) playlists.id, playlists.name, users.username FROM playlist_songs LEFT JOIN playlists ON playlists.id = playlist_id LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);

    if (!resultPlaylist.rowCount) {
      throw new NotFoundError(`Playlist ${playlistId} tidak ditemukan`);
    }
    const playlistSongs = resultPlaylist.rows[0];

    const querySong = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs LEFT JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlist_id = $1',
      values: [playlistId],
    };
    const resultSong = await this._pool.query(querySong);

    playlistSongs.songs = resultSong.rows;

    return playlistSongs;
  }

  async deletePlaylistSongById(songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError(`Playlist Song ${songId} gagal dihapus`);
    }
  }
}

module.exports = PlaylistSongsServices;
