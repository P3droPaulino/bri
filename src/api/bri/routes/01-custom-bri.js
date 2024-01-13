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
      method: 'GET',
      path: '/bri/matrizview/:id',
      handler: 'bri.matrizview',
      config: {
        description: "Visualização Matriz",
      },
    },
    {
      method: 'GET',
      path: '/bri/contagem-planos/:id', // ':id' é o ID do plano inicial
      handler: 'bri.contagemPlanos',
      config: {
        description: "Tabela Planos",
      },
    },
    {
      method: 'GET',
      path: '/bri/detalhes-planos/:id/:nivel?/:status?', // Parâmetros opcionais para nível e status
      handler: 'bri.detalhesPlanos',
      config: {
        description: "Exibe todos os dados de cada plano da matriz dos usuários abaixo",
      },
    },
    {
      method: 'GET',
      path: '/bri/meus-diretos',
      handler: 'bri.meusDiretos',
      config: {
        description: "Exibe todos os diretos do usuário atual",
      },
    },
    {
      method: 'POST',
      path: '/bri/balance',
      handler: 'bri.balance',
      config: {
        description: "Inserir ou Debitar SALDO",
      },
    },
    {
      method: 'POST',
      path: '/bri/orderpix',
      handler: 'bri.createPIX',
      config: {
        description: "Inserir ou Debitar SALDO",
      },
    },
    {
      method: 'GET',
      path: '/bri/qualificacaocount/:id',
      handler: 'bri.qualificacaocount',
      config: {
        description: "Contagem qualificação",
      },
    },
    {
      method: 'POST',
      path: '/bri/rateiobonus',
      handler: 'bri.rateiobonus',
      config: {
        description: "Exibe o valor do rateio bônus de um pedido",
      },
    },
    {
      method: 'GET',
      path: '/bri/pontosMatriz/:id',
      handler: 'bri.pontosMatriz',
      config: {
        description: "Visualizar pontos da graduação",
      },
    }
  ],
};
