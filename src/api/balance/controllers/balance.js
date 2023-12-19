'use strict';

/**
 * balance controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::balance.balance', ({ strapi }) => ({

  /**
   * Obter Pedidos de um usuário específico (Usuário Logado)
   * @source Query Example <https://docs.strapi.io/dev-docs/backend-customization/controllers#adding-a-new-controller>
   * @method GET
   */
  async me(ctx) {
    const me = ctx.state.user;
    const query = ctx.query;
    const hasFilters = query && query.filters ? true : false;
    const filters = {
      filters: {
        user: {
          id: { $eq: me.id },
        },
      },
      populate: { user: true },
    };
    
    


    try {
      if (hasFilters) {
        const oe = Object.entries(query.filters);
        for (const a in oe) {
          const key = oe[a][0];
          const val = oe[a][1];
          console.log(key, val);
          filters.filters[key] = ["true", "false"].includes(val) ? JSON.parse(oe[a][1]) : oe[a][1];
        }
      }
    } catch (e) {
      console.log();
    }

    // @ts-ignore
    const balances = await strapi.entityService.findMany('api::balance.balance', filters);

    // Adiciona a chave "balance_total" a cada item no array
    const balancesWithTotal = balances.map(balance => ({
      ...balance,
      balance_total: balance.balance_available + balance.balance_blocked,
    }));

    return balancesWithTotal;
  },
}));
