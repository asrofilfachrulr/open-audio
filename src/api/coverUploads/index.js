const UploadCoverHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploadCover',
  version: '1.0.0',
  register: async (server, { storageService, albumsService, validator }) => {
    const uploadCoverHandler = new UploadCoverHandler(storageService, albumsService, validator);
    server.route(routes(uploadCoverHandler));
  },
};
