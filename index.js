const logger = require('pino')();
const init = require('./src');

const { name, PORT } = require('./src/config');

(async () => {
  const app = await init();
  app.listen(PORT, () => {
    logger.info({ msg: `${name} is listening on port ${PORT}` });
  });
})();
