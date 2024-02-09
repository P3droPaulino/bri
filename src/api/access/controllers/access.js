'use strict';

/**
 * access controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::access.access', ({ strapi }) => ({

    async impersonate(ctx) {
    
        const { userId } = ctx.params;
    
        try {
          const user = await strapi.entityService.findOne("plugin::users-permissions.user", userId, { populate: "*" });
    
          if (!user) {
            return ctx.notFound('User not found');
          }
    
          const token = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });
    
          // Retorna o token gerado
          ctx.body = { token };
        } catch (error) {
          ctx.badRequest('Error while impersonating user', { error });
        }
      },
}));
