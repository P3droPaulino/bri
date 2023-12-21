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
    const query = ctx.query; //Funcionando
    const hasFilters = query && query.filters ? true : false;
    // console.log("[hasFilters]", query, hasFilters);
    const filters = {
      filters: {
        user: {
          id: { $eq: me.id },
        },
      },
      populate: {
        produto: true,
        user: true,
      },
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

}));
