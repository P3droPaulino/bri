module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/users/:userId/impersonate',
      handler: 'access.impersonate',
      config: {
        auth: false,
      },
    }
  ],
};
