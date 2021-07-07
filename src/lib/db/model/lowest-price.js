const mongoose = require('mongoose');

const { mongo: { LOWEST_PRICE_COLLECTION, LOWEST_PRICE_MODEL } } = require('../../../config')

const lowestPriceSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  retailerId: { type: String, required: true },
  retailPrice: { type: Number, required: true },
  isInStock: { type: Boolean, required: true },
  discountPrice: { type: Number, required: false },
});

module.exports = mongoose.model(
  LOWEST_PRICE_MODEL,
  lowestPriceSchema,
  LOWEST_PRICE_COLLECTION,
);
