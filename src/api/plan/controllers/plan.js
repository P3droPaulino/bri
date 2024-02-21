'use strict';

/**
 * plan controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { removerCamposSensiveis} = require('../../bri/controllers/utils');

module.exports = createCoreController('api::plan.plan', ({ strapi }) => ({

/**
   * Obter Plans de um usuário específico (Usuário Logado)
   * @source Query Example <https://docs.strapi.io/dev-docs/backend-customization/controllers#adding-a-new-controller>
   * @method GET
   */
//   async me(ctx) {
//     const me = ctx.state.user;
//     const { filters, pagination } = ctx.query;

//     // Configurações de paginação
//     const page = pagination && pagination.page ? parseInt(pagination.page) : 1;
//     const pageSize = pagination && pagination.pageSize ? parseInt(pagination.pageSize) : 10;

//     // Inicializando os filtros com um filtro para o usuário
//     const filterConditions = {
//         user: {
//             id: { $eq: me.id },
//         },
//     };

//     // Processar filtros adicionais
//     if (filters) {
//         for (const field in filters) {
//             filterConditions[field] = filters[field];
//         }
//     }

//     // Calcula o início com base na página e no tamanho da página
//     const start = (page - 1) * pageSize;

//     // Executa a consulta com paginação e filtros
//     const plans = await strapi.entityService.findMany('api::plan.plan', {
//         filters: filterConditions,
//         start,
//         limit: pageSize,
//         sort: { createdAt: 'desc' },
//         populate: '*',

//     });

//     const planosProcessados = plans.map(removerCamposSensiveis);

//     // Calcula o total de registros para a paginação
//     const total = await strapi.entityService.count('api::plan.plan', { filters: filterConditions });


//     // Ajusta os resultados para o formato desejado
//     const adjustedResults = planosProcessados.map(item => ({
//         id: item.id,
//         attributes: {
//             ...item,
//             user: {
//                 data: {
//                     id: item.user.id,
//                     attributes: { ...item.user }
//                 }
//             }
//         }
//     }));

//     // Remover as propriedades não desejadas de cada item
//     adjustedResults.forEach(item => {
//         delete item.attributes.user.id;
//         delete item.attributes.id;
//     });

//     // Formata a resposta
//     return {
//         data: adjustedResults,
//         meta: {
//             pagination: {
//                 page,
//                 pageSize,
//                 pageCount: Math.ceil(total / pageSize),
//                 total,
//             },
//         },
//     };
// },

async me(ctx) {
    const me = ctx.state.user;
    const query = ctx.query; //Funcionando
    const hasFilters = query && query.filters ? true : false;
    // console.log("[hasFilters]", query, hasFilters);
    const filters = {
      filters: {
        user: {
          id: { $eq: me.id },
        },
      },
      populate:
      {
        user: true,
        }
    };
    try {
      if (hasFilters) {
        const oe = Object.entries(query.filters)
        for (const a in oe) {
          const key = oe[a][0];
          const val = oe[a][1];
          console.log(key, val);
          filters.filters[key] = ["true", "false"].includes(val) ? JSON.parse(oe[a][1]) : oe[a][1]
        }
      }
      // console.log("FILTERS", filters, JSON.stringify(filters, null, 2));
    } catch (e) {
      console.log();
    }
    const plans = await strapi.entityService.findMany('api::plan.plan', filters);

    const planosProcessados = plans.map(removerCamposSensiveis);

    //const statusGeral = planosProcessados.some(plano => plano.statusAtivacao);

    //planosProcessados.push({ statusGeral: statusGeral });


    return planosProcessados;

  },



  async myinactive(ctx) {
    const me = ctx.state.user;
    const query = ctx.query;
    const hasFilters = query && query.filters ? true : false;

    const filters = {
        filters: {
            user: {
                id: { $eq: me.id },
            },
            $or: [
                { statusAtivacao: { $eq: false } },
                { statusAtivacao: { $null: true } }
            ]
        },
        populate: {
            user: true,
        },
    };

    try {
        if (hasFilters) {
            const oe = Object.entries(query.filters);
            for (const [key, val] of oe) {
                console.log(key, val);
                filters.filters[key] = ["true", "false"].includes(val) ? JSON.parse(val) : val;
            }
        }
        // console.log("FILTERS", filters, JSON.stringify(filters, null, 2));
    } catch (e) {
        console.error("Error processing filters:", e);
    }

    const plans = await strapi.entityService.findMany('api::plan.plan', filters);
    return plans;
}

}));
