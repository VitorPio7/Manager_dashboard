const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const products = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Product name is required.'],
        },
        price: {
            type: Schema.Types.Decimal128,
            required: [true, 'Product price is required.'],
            min: [0, 'Price must be greater than or equal to 0.']
        },
        imageUrl: {
            type: String,
            required: [true, 'You need to put an image.']
        },
        quantity: {
            type: Number,
            required: true,
            min: [0, 'You have to put at least 0 to create a product.']
        },
        category: {
            type: String,
            required: [true, 'Product category is required'],
            enum: {
                values: ['eletronics', 'clothing', 'books', 'food'],
                message: '{VALUE} is not a valid category'
            }
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'You must pass the creator of this product!!!']
        }

    },
    { timestamps: true }
)

module.exports = mongoose.model('products', products);