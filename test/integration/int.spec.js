const supertest = require('supertest');
const init = require('../../src');
const { name } = require('../../package.json');

describe(`${name} API test`, () => {
  let request;

  beforeAll(async () => {
    const app = await init();
    request = supertest(app);
  });

  describe('Liveness route', () => {
    it('can successfully check the liveness of the service', async () => {
      const res = await request.get('/liveness');
      expect(res.status).toBe(200);
      const parsedResponse = JSON.parse(res.text);
      expect(parsedResponse).toEqual({ status: 'OK' });
    });
  });
});
