module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/balances/me',
      handler: 'balance.me'
    }
    // {
    //   method: 'POST',
    //   path: '/accounts/createpix',
    //   handler: 'account.createPIX'
    // }
  ],
};
