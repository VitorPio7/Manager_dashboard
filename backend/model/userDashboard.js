const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'You need to put a name.']
    },
    email: {
        type: String,
        required: [true, 'You need to put an email.']
    },
    password: {
        type: String,
        required: [true, 'You need to put a password.']
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    confirmationToken: String,
    tokenRedefinition: String,
    tokenExpires: Date,
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'products'
        }
    ]
})

module.exports = mongoose.model('User', userSchema);