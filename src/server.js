require('dotenv').config();

const Hapi = require('@hapi/hapi');

// exceptions
const ClientError = require('./exceptions/ClientError');
const InternalServerError = require('./exceptions/InternalServerError');

// plugins
const songs = require('./api/songs');
const albums = require('./api/albums');
const users = require('./api/users');
const auth = require('./api/authentications');

// services
const SongsService = require('./services/postgres/SongsServices');
const AlbumsService = require('./services/postgres/AlbumsServices');
const UsersService = require('./services/postgres/UsersServices');
const AuthService = require('./services/postgres/AuthenticationsServices');

// validators
const SongValidator = require('./validator/songs');
const AlbumValidator = require('./validator/albums');
const UserValidator = require('./validator/users');
const AuthValidator = require('./validator/authentications');

// tokenize
const tokenManager = require('./tokenize/TokenManager');

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const authService = new AuthService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([{
    plugin: songs,
    options: {
      service: songsService,
      validator: SongValidator,
    },
  },
  {
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumValidator,
    },
  },
  {
    plugin: users,
    options: {
      service: usersService,
      validator: UserValidator,
    },
  },
  {
    plugin: auth,
    options: {
      authService,
      usersService,
      tokenManager,
      validator: AuthValidator,
    },
  }]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    } if (response instanceof InternalServerError) {
      const newResponse = h.response({
        status: 'error',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
