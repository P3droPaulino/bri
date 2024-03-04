
module.exports = {
    routes: [
         {
             method: 'GET',
            path: '/reports/fila-unica',
            handler: 'report.obterFila',
            config: {
                description: "Relatório Fila única"
            },
        },
       
    ],
  };
