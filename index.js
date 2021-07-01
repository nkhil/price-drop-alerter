const logger = require('pino')();
const init = require('./src');

const { name, port } = require('./src/config');

(async () => {
  const app = await init();
  app.listen(port, () => {
    logger.info({ msg: `${name} is listening on port ${port}` });
  });
})();
