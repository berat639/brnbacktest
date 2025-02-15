'use strict';

/**
 * campaign controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::campaign.campaign', ({
  strapi
}) => ({
  async find(ctx) {
    try {
      const { query } = ctx;
      
      // Get current date for comparison
      const currentDate = new Date().toISOString();
      
      // Add date filtering to the query
      const dateFilter = {
        $and: [
          { startDate: { $lte: currentDate } },
          { endDate: { $gte: currentDate } },
          { isActive: true }
        ]
      };
      
      // Merge with existing filters if any
      query.filters = {
        ...(typeof query.filters === 'object' && query.filters !== null ? query.filters : {}),
        ...dateFilter
      };
      
      // Find campaigns with populated relations
      const entries = await strapi.entityService.findMany('api::campaign.campaign', {
        ...query,
      });

      const total = await strapi.entityService.count('api::campaign.campaign', {
        filters: query.filters
      });

      // Format response to match content manager structure
      return {
        results: entries,
       
      };
    } catch (error) {
      // Handle any errors
      ctx.throw(500, error);
    }
  }
}));