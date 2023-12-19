'use strict';

/**
 * bri service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bri.bri');
