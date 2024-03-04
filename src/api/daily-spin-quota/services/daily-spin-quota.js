'use strict';

/**
 * daily-spin-quota service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::daily-spin-quota.daily-spin-quota');
