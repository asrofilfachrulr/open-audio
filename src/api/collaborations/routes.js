const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollaborationsHandler,
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationsHandler,
  },
];

module.exports = routes;
