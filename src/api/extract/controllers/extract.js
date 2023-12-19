'use strict';

/**
 * extract controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::extract.extract');
