'use strict';

/**
 * graduation service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::graduation.graduation');
