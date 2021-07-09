const logger = require('pino')();

const { PRICE_DROP_THRESHOLD } = require('../config');
const database = require('../lib/db/utils');
const { DatabaseError } = require('../errors/errorClasses');

function calculateLowestPrice({ retailPrice, discountPrice }) {
  if (!discountPrice) return retailPrice;
  if (discountPrice < retailPrice) return discountPrice;
  return retailPrice;
}

function checkIfPriceHasFallenBelowThreshold(lowestPricedRetailer, previousLowestPrice, priceDropThreshold) {
  const currentLowest = calculateLowestPrice(lowestPricedRetailer)
  const previousLowest = calculateLowestPrice(previousLowestPrice)
  if ((previousLowest - currentLowest) > priceDropThreshold) {
    return true
  }
  return false
}

function createPriceDropResult(alertRequired, newLowestPrice, productId) {
  if (alertRequired) {
    return {
      alertRequired: true,
      newPrice: calculateLowestPrice(newLowestPrice),
      productId,
      retailerId: newLowestPrice.retailerId,
    }
  }
  return {
    alertRequired: false,
  }
}

function handleUpsertingLowestPrice(currentLowestPrice, productId) {
  return database.upsertLowestPrice(productId, { productId, ...currentLowestPrice });
}

async function priceDropCheck(req, res) {
  try {
    const { productId, retailers } = req.body;
    logger.info({ msg: `Processing price drop check for productId: ${productId}` });
    const retailersWithStock = retailers.filter(r => r.isInStock);
    const retailerWithLowestPrice = retailersWithStock.reduce((prev, curr) => {
      return calculateLowestPrice(prev) < calculateLowestPrice(curr) ? prev : curr
    }, {});
    const previousLowestPrice = await database.getLowestPriceForProductId(productId);
    const priceDropAlertNeeded = checkIfPriceHasFallenBelowThreshold(retailerWithLowestPrice, previousLowestPrice, PRICE_DROP_THRESHOLD)
    const response = createPriceDropResult(priceDropAlertNeeded, retailerWithLowestPrice, productId)
    logger.info({ msg: `Finished processing price drop check for ${productId} with result: ${JSON.stringify(response)}` });

    res.status(200).json(response);

    return await handleUpsertingLowestPrice(retailerWithLowestPrice, productId);
  } catch (error) {
    const stringifiedError = JSON.stringify(error);
    if (error instanceof DatabaseError) {
      logger.error({ msg: `Database error occured. Error: ${stringifiedError}` });
      return res.status(error.code).json(error.message);
    } 
    logger.error({ msg: `Unknown error occured. Error: ${stringifiedError}` });
    res.status(500).json(`An unknown error occured. Error: ${stringifiedError}`);
  }
}

module.exports = {
  priceDropCheck,
}
