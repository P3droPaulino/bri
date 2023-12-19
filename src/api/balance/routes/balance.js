'use strict';

/**
 * balance router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

//module.exports = createCoreRouter('api::account.account');

/**
 * balance router
 * @source Creating custom routers <https://docs.strapi.io/dev-docs/backend-customization/routes#creating-custom-routers>
 * @source Custom core routes <https://docs.strapi.io/dev-docs/backend-customization/routes>
 */


const { createCoreController } = require('@strapi/strapi').factories;
const newRouter  = require('./01-custom-balance.js');
const { customRouter }  = require('../../../../config/helpers.js');

module.exports = customRouter(
  createCoreRouter("api::balance.balance", {
    only: ['find', 'findOne', 'create', 'delete', 'update'] // Only those in the array will be displayed
  }),
  newRouter?.routes
)
