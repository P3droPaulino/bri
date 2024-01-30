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
    const query = ctx.query; //Funcionando
    const hasFilters = query && query.filters ? true : false;
    // console.log("[hasFilters]", query, hasFilters);
    const filters = {
      filters: {
        user: {
          id: { $eq: me.id },
        },
      },
      populate: "*",
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
    const orders = await strapi.entityService.findMany('api::order.order', filters);
    return orders;

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

    if( allOrderes.length > 0 && empty(planSponsor)){
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


}));