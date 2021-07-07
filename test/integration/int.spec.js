const supertest = require('supertest');
const init = require('../../src');
const { name } = require('../../package.json');
const LowestPriceModel = require('../../src/lib/db/model/lowest-price');

jest.setTimeout(30000);

describe(`${name} API test`, () => {
  let request;

  beforeAll(async () => {
    const app = await init();
    request = supertest(app);
    await LowestPriceModel.deleteMany({});
  });

  afterEach(async () => {
    await LowestPriceModel.deleteMany({});
  })

  describe('/liveness', () => {
    it('can successfully check the liveness of the service', async () => {
      const res = await request.get('/liveness');
      expect(res.status).toBe(200);
      const parsedResponse = JSON.parse(res.text);
      expect(parsedResponse).toEqual({ status: 'OK' });
    });
  });

  describe('/price-drop-check', () => {
    it('returns an expected response when a price drop alert is required', async () => {
      const firstResponse = await request.post('/price-drop-check')
        .send({
          productId: 'PRODUCT_01',
          retailers: [
            {
              retailerId: 'retailer-01',
              retailPrice: 100,
              discountPrice: 90,
              isInStock: true,
            },
            {
              retailerId: 'retailer-02',
              retailPrice: 100,
              discountPrice: 80,
              isInStock: true,
            }
          ],
        });
      expect(firstResponse.status).toEqual(200);
      const parsedFirstResponse = JSON.parse(firstResponse.text);
      expect(parsedFirstResponse).toEqual({ alertRequired: false });
      const secondResponse = await request.post('/price-drop-check')
        .send({
          productId: 'PRODUCT_01',
          retailers: [
            {
              retailerId: 'retailer-01',
              retailPrice: 100,
              discountPrice: 60,
              isInStock: true,
            },
          ],
        });
      expect(secondResponse.status).toEqual(200)
      const parsedSecondResponse = JSON.parse(secondResponse.text);
      expect(parsedSecondResponse).toEqual({
        alertRequired: true,
        newPrice: 60,
        productId: 'PRODUCT_01',
        retailerId: 'retailer-01'
      });
    });

    it('handles a case where none of the items are in stock', async () => {
      // TODO: 
    })

    it('returns a 401 status code when productId is missing in payload', async () => {
      const res = await request.post('/price-drop-check')
        .send({
          retailers: [
            { retailerId: 'nike', retailPrice: 100, isInStock: true },
            {
              retailerId: 'offspring',
              retailPrice: 100,
              discountPrice: 90,
              isInStock: true
            }
          ]
        });
      expect(res.status).toBe(400);
    });

    it('returns a 401 status code when retailers are missing in payload', async () => {
      const res = await request.post('/price-drop-check')
        .send({
          productId: "ABC123",
        });
      expect(res.status).toBe(400);
    });

    it('returns a 401 status code when retailers are missing required properties in payload', async () => {
      const res = await request.post('/price-drop-check')
        .send({
          productId: "ABC123",
          retailers: [
            {
              retailPrice: 100,
              isInStock: true,
            },
          ]
        });
      expect(res.status).toBe(400);
    });
  });
});
