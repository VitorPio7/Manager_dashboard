const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const products = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Product name is required.'],
            unique: true
        },
        price: {
            type: Schema.Types.Decimal128,
            required: [true, 'Product price is required.'],
            min: [0, 'Price must be greater than or equal to 0.']
        },
        imageUrl: [
            {
                type: String,
                require: [true, "You need to pass at least an image."]
            }
        ],
        changedAt: {
            type: Date
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
        }

    },
    { timestamps: true }
)

products.pre('save', async function (next) {
     this.
})
products.virtual('totalPriceInStock').get(function () {
    return this.quantity * this.price
})
module.exports = mongoose.model('products', products);