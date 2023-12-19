module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/plans/me',
        handler: 'plan.me'
      },
      {
        method: 'GET',
        path: '/plans/myinactive',
        handler: 'plan.myinactive'
      }
    ],
  };
