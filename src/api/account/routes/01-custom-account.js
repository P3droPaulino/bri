module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/accounts/me',
      handler: 'account.me'
    }
    // {
    //   method: 'POST',
    //   path: '/accounts/createpix',
    //   handler: 'account.createPIX'
    // }
  ],
};
