const setTimeZone = "America/Sao_Paulo";
const {  verificarEManipularFilaUnica, verificarEManipularInativacoes } = require("../src/api/cron/controllers/utils.js");

module.exports = {
  // tests: {
  //   task: async ({ strapi }) => {
  //     console.log('O cron foi executado a cada 5 segundos!');
  //     await cronRunRecorrencia();
  //     await cronRunFilaUnica();
  //   },
  //   options: {
  //     rule: "0/5 * * * * *", // Executar todos os dias às 0:00
  //     tz: setTimeZone,
  //   },
  // },
  recorrencia: {
    task: async ({ strapi }) => {
      console.log('Rodando tarefa de: RECORRENCIA');
      await verificarEManipularInativacoes();
      const now = new Date();
    // Imprime a hora atual no console
    //console.log(`Hora atual: ${now.toISOString()}`);
    },
    options: {
      rule: "0 0 0 * * *", // Executar todos os dias às 0:00
      tz: setTimeZone,
    },
  },
  filaUnica: {
    task: async ({ strapi }) => {
      console.log('Rodando tarefa de: FILA ÚNICA');
      await verificarEManipularFilaUnica();
    },
    options: {
      rule: "0 0 0 * * *", // Executar todo dia 1 de cada mês às 0:00
      tz: setTimeZone,
    },
  },
};
