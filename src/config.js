const { name } = require('../package.json');
require('dotenv').config();

module.exports = {
  name,
  PORT: process.env.PORT || 8080,
  PRICE_DROP_THRESHOLD: process.env.PRICE_DROP_THRESHOLD,
  mongo: {
    LOWEST_PRICE_MODEL: 'LowestPrice',
    LOWEST_PRICE_COLLECTION: 'lowestPrices',
    CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING,
  },
};
