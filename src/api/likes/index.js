const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likees',
  version: '1.0.0',
  register: async (server, { userAlbumLikesService, albumsService }) => {
    const likesHandler = new LikesHandler(userAlbumLikesService, albumsService);
    server.route(routes(likesHandler));
  },
};
