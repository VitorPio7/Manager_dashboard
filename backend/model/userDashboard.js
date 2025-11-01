const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const validator = require('validator')

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'You need to put a name.']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'You need to put an email.'],
        validator: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'You need to put a password.'],
        minlenght: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'You need to confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    tokenRedefinition: String,
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'products'
        }
    ]
})
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    
    this.passwordConfirm = undefined;
    
    next()
})
module.exports = mongoose.model('User', userSchema);