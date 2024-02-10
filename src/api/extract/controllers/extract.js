'use strict';

/**
 * extract controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::extract.extract', ({ strapi }) => ({

  /**
     * Obter Pedidos de um usuário específico (Usuário Logado)
     * @source Query Example <https://docs.strapi.io/dev-docs/backend-customization/controllers#adding-a-new-controller>
     * @method GET
     */
  async me(ctx) {
    const me = ctx.state.user;
    const { filters, pagination } = ctx.query;
  
    // Configurações de paginação
    const page = pagination && pagination.page ? parseInt(pagination.page) : 1;
    const pageSize = pagination && pagination.pageSize ? parseInt(pagination.pageSize) : 10;
  
    // Inicializando os filtros com um filtro para o usuário
    const filterConditions = {
      user: {
        id: { $eq: me.id },
      },
    };
  
    // Processar filtros adicionais
    if (filters) {
      for (const field in filters) {
        filterConditions[field] = filters[field];
      }
    }
  
    // Calcula o início com base na página e no tamanho da página
    const start = (page - 1) * pageSize;
  
    // Executa a consulta com paginação e filtros
    const results = await strapi.entityService.findMany('api::extract.extract', {
      filters: filterConditions,
      start,
      limit: pageSize,
      populate: '*',
    });
  
    // Calcula o total de registros para a paginação
    const total = await strapi.entityService.count('api::extract.extract', { filters: filterConditions });

    // Ajusta os resultados para o formato desejado
    const adjustedResults = results.map(item => {
      // Transforma cada item para incluir 'attributes' e ajusta 'user' e 'plan'
      return {
          id: item.id,
          attributes: {
              ...item,
              user: item.user ? {
                  data: {
                      id: item.user.id,
                      attributes: { ...item.user }
                  }
              } : undefined, // Ajuste condicional para 'user'
              plan: item.plan ? {
                  data: {
                      id: item.plan.id,
                      attributes: { ...item.plan }
                  }
              } : undefined, // Ajuste condicional para 'plan'
          }
      };
  });

  // Remove propriedades indesejadas de 'attributes' para cada item
  adjustedResults.forEach(item => {
      delete item.attributes.id; // Remova se necessário
      if (item.attributes.user) {
          delete item.attributes.user.data.attributes.id;
      }
      if (item.attributes.plan) {
          delete item.attributes.plan.data.attributes.id;
      }
  });
  
    // Formata a resposta
    return {
      data: adjustedResults,
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
