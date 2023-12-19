'use strict';

/**
 * bri router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::bri.bri');
const newRouter  = require('./01-custom-bri.js');
const { customRouter }  = require('../../../../config/helpers.js');

module.exports = customRouter(
    createCoreRouter("api::bri.bri", {
      only: [] // Only those in the array will be displayed
    }),
    newRouter?.routes
  )