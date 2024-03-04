module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/daily-spin-quotas/create/cotas', // Ajuste o caminho conforme necessário
        handler: 'daily-spin-quota.createQuotas', // [Nome do controlador].[Método]
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
        method: 'POST',
        path: '/daily-spin-quotas/sorteio',
        handler: 'daily-spin-quota.realizarSorteio',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
        method: 'GET',
        path: '/daily-spin-quotas/me',
        handler: 'daily-spin-quota.me',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
        method: 'GET',
        path: '/daily-spin-quotas/me/count',
        handler: 'daily-spin-quota.mecount',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };
