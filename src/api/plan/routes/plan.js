'use strict';

/**
 * plan router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

//module.exports = createCoreRouter('api::account.account');

/**
 * 
 * account router
 * @source Creating custom routers <https://docs.strapi.io/dev-docs/backend-customization/routes#creating-custom-routers>
 * @source Custom core routes <https://docs.strapi.io/dev-docs/backend-customization/routes>
 */


const { createCoreController } = require('@strapi/strapi').factories;
const newRouter  = require('./01-custom-plan.js');
const { customRouter }  = require('../../../../config/helpers.js');
// export default factories.createCoreRouter('api::bank-balance.bank-balance'); // Original router

module.exports = customRouter(
  createCoreRouter("api::plan.plan", {
    only: ['find', 'findOne', 'create', 'delete', 'update'] // Only those in the array will be displayed
  }),
  newRouter?.routes
)
