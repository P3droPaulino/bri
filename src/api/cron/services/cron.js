'use strict';

/**
 * cron service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::cron.cron');
