'use strict';

/**
 * daily-spin-result controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::daily-spin-result.daily-spin-result', ({ strapi }) => ({

/**
     * Obter Pedidos de um usuário específico (Usuário Logado)
     * @source Query Example <https://docs.strapi.io/dev-docs/backend-customization/controllers#adding-a-new-controller>
     * @method GET
     */
async all(ctx) {
    const { filters, pagination } = ctx.query;

    // Configurações de paginação
    const page = pagination && pagination.page ? parseInt(pagination.page) : 1;
    const pageSize = pagination && pagination.pageSize ? parseInt(pagination.pageSize) : 10;

    // Calcula o início com base na página e no tamanho da página
    const start = (page - 1) * pageSize;


    const filterConditions = {
        
      };


      //filters = filters.slice(0, -1); // Remove o último caractere
    if (filters) {
        for (const field in filters) {
          filterConditions[field] = filters[field];
          filterConditions[field];
        }
      }

    console.log(filterConditions);
    // Executa a consulta com paginação e filtros
    const results = await strapi.entityService.findMany('api::daily-spin-result.daily-spin-result', {
        filters: filterConditions,
        start,
        limit: pageSize,
        populate: {
            daily_spin_quota: {
                populate: {
                    user: true
                }
            }
        },
        sort: { createdAt: 'desc' },
    });

    // Mantém apenas os campos desejados
    const data = results.map(item => {
        // Reconstrói o objeto para o resultado principal, se necessário
        // Por exemplo, se o resultado principal tiver campos para manter
        // item = { fullName: item.fullName, username: item.username };

        // Reconstrói o objeto para daily_spin_quota.user
        if (item.daily_spin_quota && item.daily_spin_quota.user) {
            item.daily_spin_quota.user = {
                fullName: item.daily_spin_quota.user.fullName,
                username: item.daily_spin_quota.user.username,
            };
        }

        return item;
    });

    // Calcula o total de registros para a paginação
    const total = await strapi.entityService.count('api::daily-spin-result.daily-spin-result', { filters: filterConditions });

    // Formata a resposta
    return {
        data,
        meta: {
            pagination: {
                page,
                pageSize,
                pageCount: Math.ceil(total / pageSize),
                total,
            },
        },
    };
}



}));
