const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const products = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Schema.Types.Decimal128,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },

},
    { timestamps: true }
)

module.exports = mongoose.model('products', products);