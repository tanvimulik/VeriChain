// Export all models from a single file for easy importing
module.exports = {
    User: require('./User'),
    Farmer: require('./Farmer'),
    Buyer: require('./Buyers'),
    LogisticsOrg: require('./LogisticsOrg'),
    Crop: require('./Crop'),
    Order: require('./Order'),
    Truck: require('./Truck'),
    Hub: require('./Hub'),
    FPOStorage: require('./FPOStorage'),
    Cluster: require('./Cluster'),
    ClusterAssignment: require('./ClusterAssignment'),
    Payment: require('./Payment'),
    Rating: require('./Rating'),
    Notification: require('./Notification'),
    MandiPrice: require('./MandiPrice')
  };
  