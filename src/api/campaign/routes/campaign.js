module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/campaigns',
      handler: 'campaign.find',
      config: {
        auth: false,
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/campaigns/:id',
      handler: 'campaign.findOne',
      config: {
        auth: false,
        policies: []
      }
    }
  ]
};