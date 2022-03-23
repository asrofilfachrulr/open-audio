// plugins
const songs = require('./api/songs');
const albums = require('./api/albums');
const users = require('./api/users');
const auth = require('./api/authentications');
const playlists = require('./api/playlists');
const playlistSongs = require('./api/playlistSongs');
const collaborations = require('./api/collaborations');
const playlistSongActivities = require('./api/playlistSongActivities');

// services
const SongsService = require('./services/postgres/SongsServices');
const AlbumsService = require('./services/postgres/AlbumsServices');
const UsersService = require('./services/postgres/UsersServices');
const AuthService = require('./services/postgres/AuthenticationsServices');
const PlaylistService = require('./services/postgres/PlaylistsServices');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsServices');
const CollaborationsService = require('./services/postgres/CollaborationsServices');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesServices');

// validators
const SongValidator = require('./validator/songs');
const AlbumValidator = require('./validator/albums');
const UserValidator = require('./validator/users');
const AuthValidator = require('./validator/authentications');
const PlaylistValidator = require('./validator/playlists');
const PlaylistSongsValidator = require('./validator/playlistSongs');
const CollaborationsValidator = require('./validator/collaborations');

const songsService = new SongsService();
const albumsService = new AlbumsService();
const usersService = new UsersService();
const authService = new AuthService();
const playlistsService = new PlaylistService();
const collaborationsService = new CollaborationsService();
const playlistSongsService = new PlaylistSongsService(collaborationsService);
const playlistSongActivitiesService = new PlaylistSongActivitiesService();

// tokenize
const TokenManager = require('./tokenize/TokenManager');

module.exports = [{
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
  plugin: playlists,
  options: {
    service: playlistsService,
    validator: PlaylistValidator,
  },
},
{
  plugin: playlistSongs,
  options: {
    service: playlistSongsService,
    validator: PlaylistSongsValidator,
  },
},
{
  plugin: collaborations,
  options: {
    collaborationsService,
    playlistsService,
    usersService,
    validator: CollaborationsValidator,
  },
},
{
  plugin: playlistSongActivities,
  options: {
    playlistsService,
    playlistSongActivitiesService,
  },
},
{
  plugin: auth,
  options: {
    authService,
    usersService,
    tokenManager: TokenManager,
    validator: AuthValidator,
  },
}];
