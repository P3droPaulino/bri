'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { bodyOrderCreate, getProduct, allOrders, planPatrocinador } = require('../../order/controllers/utils');
const { empty } = require('../../bri/controllers/utils');

module.exports = createCoreController('api::order.order', ({ strapi }) => ({


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
        filterConditions[field];
      }
    }

    // Calcula o início com base na página e no tamanho da página
    const start = (page - 1) * pageSize;

    // Executa a consulta com paginação e filtros
    const results = await strapi.entityService.findMany('api::order.order', {
      filters: filterConditions,
      start,
      limit: pageSize,
      populate: '*',
      sort: { createdAt: 'desc' },
    });


    // Calcula o total de registros para a paginação
    const total = await strapi.entityService.count('api::order.order', { filters: filterConditions });

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
          product: item.product ? {
            data: {
              id: item.product.id,
              attributes: { ...item.product }
            }
          } : undefined, // Ajuste condicional para 'plan'
          plan_accession: item.plan_accession ? {
            data: {
              id: item.plan_accession.id,
              attributes: { ...item.plan_accession }
            }
          } : undefined, // Ajuste condicional para 'plan'
          plan_subscription: item.plan_subscription ? {
            data: {
              id: item.plan_subscription.id,
              attributes: { ...item.plan_subscription }
            }
          } : undefined, // Ajuste condicional para 'plan'
          plan_patrocinador: item.plan_patrocinador ? {
            data: {
              id: item.plan_patrocinador.id,
              attributes: { ...item.plan_patrocinador }
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
      if (item.attributes.product) {
        delete item.attributes.product.data.attributes.id;
      }
      if (item.attributes.plan_accession) {
        delete item.attributes.plan_accession.data.attributes.id;
      }
      if (item.attributes.plan_subscription) {
        delete item.attributes.plan_subscription.data.attributes.id;
      }
      if (item.attributes.plan_patrocinador) {
        delete item.attributes.plan_patrocinador.data.attributes.id;
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
  },

  /**
   * CRIAR PEDIDO, Modificado para criar as redes
   * @author DanSP <daniel.rootdir@gmail.com>
   * @param {*} ctx
   * @property { Object } ctx.data - Objecto DATA
   * @property { Object } data - Objecto de BODY do pedido
   * @property  { Number } user  - ID do usuário
   * @property { Number} product - ID do produto
   * @property { String } modoPagamento - ["saldo", "pix"]: Modo de pagamento
   * @return { Promise<any> }
   */
  async create(ctx) {
    const me = ctx.state.user;
    const { data } = ctx.request.body;
    const product = await getProduct(data?.product); // Obter dados do produto que será comprado
    const allOrderes = await allOrders();
    const planSponsor = await planPatrocinador(data?.user); // ID patrocinador MESTRE

    console.log("voltou aqui!")

    if (allOrderes.length > 0 && empty(planSponsor)) {
      ctx.send({
        status: false,
        message: "Você precisa de um patrocinador para realizar pedidos, entre em contato com o suporte se precisar de ajuda."
      }, 201);
    }

    //console.log("createOrder::planSponsor", planSponsor);

    //const oid = await LMO(planSponsor); // Obter ID para derramento
    const createOrder = await bodyOrderCreate({
      product: product,
      data: data,
      //oid: oid,
      planSponsor: planSponsor,
    });
    //console.log("createOrder::", createOrder);
    ctx.send(createOrder, 200); //Enviar resposta
  },



  async meId(ctx) {
    const me = ctx.state.user;
    const { id } = ctx.params; // Assume que 'id' é passado na URL como /me/:id

    // Verifica se o ID foi fornecido
    if (!id) {
      return ctx.throw(400, 'ID is required');
    }

    // Inicializa os filtros para buscar pelo ID e garantir que pertença ao usuário logado
    const filterConditions = {
      id: { $eq: id }, // Garante que o ID corresponda
      user: { id: { $eq: me.id } }, // Garante que o registro pertença ao usuário logado
    };

    // Executa a busca pelo registro específico
    const result = await strapi.entityService.findOne('api::order.order', id, {
      filters: filterConditions,
      populate: '*', // Popula todos os relacionamentos, ajuste conforme necessário
    });

    // Verifica se o registro foi encontrado
    if (!result) {
      return ctx.throw(404, 'Order not found');
    }

    // Ajusta o resultado para o formato desejado (Se necessário)
    const adjustedResult = {
      id: result.id,
      attributes: {
        ...result,
        // Ajustes específicos para 'user', 'plan', etc., se necessário
      },
    };

    // Retorna o registro encontrado
    return {
      data: adjustedResult,
    };
  }

}));