'use strict';

const { createQuotas, realizarSorteio} = require('../../daily-spin-quota/controllers/utils');

/**
 * daily-spin-quota controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::daily-spin-quota.daily-spin-quota', ({ strapi }) => ({

async createQuotas(ctx) {
    const { userId, planId, orderId, quantity } = ctx.request.body;

    try {
      await createQuotas(strapi, userId, planId, orderId, quantity);
      ctx.send({ message: 'Cotas criadas com sucesso' }, 200);
    } catch (error) {
      console.error('Erro ao criar cotas:', error);
      ctx.send({ message: 'Erro ao criar cotas', error: error.message }, 500);
    }
  },



    async realizarSorteio(ctx) {
      try {

        const { nivel } = ctx.request.body; // Extrai o nível a partir do corpo da requisição
  
        if (nivel === undefined) {
          return ctx.badRequest('O nível é necessário para realizar o sorteio.');
        }
  
        // Chama a função realizarSorteio definida anteriormente, passando o strapi e o nível

        console.log("chamando função do sorteio");
        const resultado = await realizarSorteio(nivel);
  
        if (resultado) {
          // Retorna os resultados do sorteio
          ctx.body = resultado;
        } else {
          ctx.badRequest('Não foi possível realizar o sorteio.');
        }
      } catch (error) {
        ctx.internalServerError('Ocorreu um erro ao tentar realizar o sorteio.');
      }
    },
  
    async me(ctx) {
      const me = ctx.state.user;
      const { filters, pagination } = ctx.query;
  
      // Configurações de paginação
      const page = pagination && pagination.page ? parseInt(pagination.page) : 1;
      const pageSize = pagination && pagination.pageSize ? parseInt(pagination.pageSize) : 10;
  
      // Calcula o início com base na página e no tamanho da página
      const start = (page - 1) * pageSize;
  
  
      const filterConditions = {
        user: {
          id: { $eq: me.id },
        },
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
      const data = await strapi.entityService.findMany('api::daily-spin-quota.daily-spin-quota', {
          filters: filterConditions,
          start,
          limit: pageSize,
          populate: {
          
          },
          sort: { createdAt: 'desc' },
      });
  
      // Mantém apenas os campos desejados
     
  
      // Calcula o total de registros para a paginação
      const total = await strapi.entityService.count('api::daily-spin-quota.daily-spin-quota', { filters: filterConditions });
  
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
  },
  

  async mecount(ctx) {
    const me = ctx.state.user;

    // Filtro base para buscar os itens do usuário
    const filterConditions = {
        user: {
            id: { $eq: me.id },
        },
    };

    // Busca todos os itens que correspondem ao filtro do usuário
    const items = await strapi.entityService.findMany('api::daily-spin-quota.daily-spin-quota', {
        filters: filterConditions,
        populate: { level: true }, // Assegura-se de que o campo 'level' seja populado se for uma relação
    });

    // Agora, vamos contar os itens por nível
    const countsByLevel = {};

    items.forEach(item => {
        // Assume-se aqui que 'level' é um campo direto; se for uma relação, pode ser necessário ajustar o acesso a 'item.level'
        const level = item.level;
        if (countsByLevel[level]) {
            countsByLevel[level]++;
        } else {
            countsByLevel[level] = 1;
        }
    });

    // Prepara e retorna a resposta
    const response = {};

    // Converte as chaves para o formato "level X"
    for (const level in countsByLevel) {
        response[`level ${level}`] = countsByLevel[level];
    }

    return response;
}

}));