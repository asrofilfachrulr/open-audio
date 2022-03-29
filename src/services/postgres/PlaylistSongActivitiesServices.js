const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InternalServerError = require('../../exceptions/InternalServerError');

class PlaylistSongActivitiesService {
  constructor(cacheService) {
    this._cacheService = cacheService;
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
    await this._cacheService.delete(`activities:${playlistId}`);
  }

  async getActivityByPlaylistId(playlistId) {
    try {
      const result = await this._cacheService.get(`activities:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT u.username, s.title, a.action, a.time FROM playlist_song_activities a LEFT JOIN users u ON a.user_id = u.id LEFT JOIN songs s ON a.song_id = s.id WHERE a.playlist_id = $1',
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`activities:${playlistId}`, JSON.stringify(result.rows));
      return result.rows;
    }
  }
}

module.exports = PlaylistSongActivitiesService;
