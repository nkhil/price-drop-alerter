const { name } = require('../package.json');
require('dotenv').config();

module.exports = {
  name,
  port: process.env.PORT || 8080,
};
