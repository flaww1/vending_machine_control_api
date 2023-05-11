const { createPool } = require('mysql');

const productSchema = mongoose.Schema({
  productId: mongoose.Types.ObjectId,
  productType: String,
  productName: String,
  productPrice: Number,
  productStock: Number,
  productInfo: String,
  productPurchaseDate: Date,

});

module.exports = mongoose.model('Product', productSchema);
