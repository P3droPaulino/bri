'use strict';

/**
 * apportionment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::apportionment.apportionment');
