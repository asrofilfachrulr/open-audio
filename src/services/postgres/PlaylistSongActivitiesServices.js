const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InternalServerError = require('../../exceptions/InternalServerError');

class PlaylistSongActivities {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `act-${nanoid(16)}`;
    const time = new Date();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InternalServerError('Error dalam me-logging aktivitas');
    }
  }

  async getActivityByPlaylistId(id) {
    const query = {
      text: 'SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities LEFT JOIN playlists ON playlist_song_activities.playlist_id = playlists.id LEFT JOIN users ON playlists.owner = users.id LEFT JOIN playlist_songs ON playlists.id = playlist_songs.playlist_id LEFT JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_song_activities.playlist_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistSongActivities;
