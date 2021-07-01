const logger = require('pino')();

function liveness(_, res) {
  logger.info({ msg: 'Liveness request received' });
  res.status(200).json({ status: 'OK' });
}

module.exports = {
  liveness,
};
