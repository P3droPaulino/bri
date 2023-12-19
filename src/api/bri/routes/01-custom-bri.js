module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/bri/sponsor',
        handler: 'bri.sponsor',
        config: {
            description: "Buscar patrocionador pelo nome de usuário",
        },
      },
      {
        method: 'GET',
        path: '/bri/fila-unica',
        handler: 'bri.plansFilaUnicaGET',
        config: {
            description: "Fila única",
        },
      },
      {
        method: 'POST',
        path: '/bri/balance',
        handler: 'bri.balance',
        config: {
            description: "Inserir ou Debitar SALDO",
        },
      }

    ],
  };
