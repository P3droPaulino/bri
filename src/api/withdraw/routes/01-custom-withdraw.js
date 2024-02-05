module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/withdraws/me',
        handler: 'withdraw.me'
      },
      {
        method: 'POST',
        path: '/withdraws/payment',
        handler: 'withdraw.createPayment'
      }
    ],
  };
