const logger = require('pino')();
const mongoose = require('mongoose')

const { mongo: { CONNECTION_STRING } } = require('../../config');

mongoose.set('useCreateIndex', true);

async function connect() {
  try {
    await mongoose.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.connection.on('connected', () => logger.info('Connected to database'));
    mongoose.connection.on('disconnected', () => logger.info('Disconnected from database'));
  } catch (err) {
    logger.error('Error connecting to database');
    logger.error('Error:', err);
  }
}

async function disconnect() {
  try {
    await mongoose.connection.close();
  } catch (error) {
    logger.error(`Error connecting to database: ${error}`);
  }
}

module.exports = {
  connect,
  disconnect,
};
