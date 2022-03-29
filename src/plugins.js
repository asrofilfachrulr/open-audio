const path = require('path');

// plugins
const songs = require('./api/songs');
const albums = require('./api/albums');
const users = require('./api/users');
const auth = require('./api/authentications');
const playlists = require('./api/playlists');
const playlistSongs = require('./api/playlistSongs');
const collaborations = require('./api/collaborations');
const playlistSongActivities = require('./api/playlistSongActivities');
const exportsapi = require('./api/exports');
const coverUploads = require('./api/coverUploads');
const likes = require('./api/likes');

// services
const SongsService = require('./services/postgres/SongsServices');
const AlbumsService = require('./services/postgres/AlbumsServices');
const UsersService = require('./services/postgres/UsersServices');
const AuthService = require('./services/postgres/AuthenticationsServices');
const PlaylistService = require('./services/postgres/PlaylistsServices');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsServices');
const CollaborationsService = require('./services/postgres/CollaborationsServices');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesServices');
const ExportProducerService = require('./services/rabbitmq/ExportProducerService');
const StorageService = require('./services/storage/StorageService');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesServices');

// validators
const SongValidator = require('./validator/songs');
const AlbumValidator = require('./validator/albums');
const UserValidator = require('./validator/users');
const AuthValidator = require('./validator/authentications');
const PlaylistValidator = require('./validator/playlists');
const PlaylistSongsValidator = require('./validator/playlistSongs');
const CollaborationsValidator = require('./validator/collaborations');
const ExportValidator = require('./validator/exports');
const CoverUploadValidator = require('./validator/coverUploads');

// instantiation service
const songsService = new SongsService();
const albumsService = new AlbumsService();
const usersService = new UsersService();
const authService = new AuthService();
const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistService(collaborationsService);
const playlistSongsService = new PlaylistSongsService();
const playlistSongActivitiesService = new PlaylistSongActivitiesService();
const storageService = new StorageService(path.resolve(__dirname, 'api/coverUploads/file'));
const userAlbumLikesService = new UserAlbumLikesService();

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
    songsService,
    playlistsService,
    playlistSongsService,
    playlistSongActivitiesService,
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
  plugin: exportsapi,
  options: {
    exportProducerService: ExportProducerService,
    playlistsService,
    validator: ExportValidator,
  },
},
{
  plugin: coverUploads,
  options: {
    storageService,
    albumsService,
    validator: CoverUploadValidator,
  },
},
{
  plugin: likes,
  options: {
    userAlbumLikesService,
    albumsService,
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
