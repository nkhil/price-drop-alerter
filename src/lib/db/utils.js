const model = require('./model/lowest-price');
const errors = require('../../errors/errors');
const { DatabaseError } = require('../../errors/errorClasses');

async function getLowestPriceForProductId(productId) {
  try {
    const query = { productId };
    const [lowestPriceRecord] = await model.find(query);
    return lowestPriceRecord || {};
  } catch (error) {
    const { code } = errors.ERR_01;
    throw new DatabaseError(code, error);
  }
}

async function upsertLowestPrice(productId, retailerInfo) {
  try {
    const query = { productId };
    return await model.findOneAndUpdate(query, retailerInfo, { upsert: true, useFindAndModify: true });
  } catch (error) {
    const { code } = errors.ERR_01;
    throw new DatabaseError(code, error);
  }
}

module.exports = {
  getLowestPriceForProductId,
  upsertLowestPrice,
};
