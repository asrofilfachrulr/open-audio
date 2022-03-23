const PlaylistSongActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist_song_activities',
  version: '1.0.0',
  register: async (server, { playlistService, playlistSongActivitiesService }) => {
    // eslint-disable-next-line max-len
    const playlistSongActivitiesHandler = new PlaylistSongActivitiesHandler(playlistService, playlistSongActivitiesService);
    server.route(routes(playlistSongActivitiesHandler));
  },
};
