module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/orders/me',
        handler: 'order.me'
      },
      {
        method: 'GET',
        path: '/orders/me/:id',
        handler: 'order.meId'
      },
    ],
  };
