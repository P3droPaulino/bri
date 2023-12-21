'use strict';

/**
 * plan controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::plan.plan', ({ strapi }) => ({

/**
   * Obter Plans de um usuário específico (Usuário Logado)
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
    return plans;

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
