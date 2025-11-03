const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const validator = require('validator')

const bcrypt = require('bcrypt')

const crypto = require('crypto');


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
    photo: {
        type: String,
        default: 'default.jpg'
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
    confirmationToken: String,
    confirmationTokenExpires: Date,
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
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

//Verify automatelly and registry if there is a change in the password
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now()
})

userSchema.methods.correctPassword = async function (inputPassword, userPassword) {
    return await bcrypt.compare(inputPassword, userPassword)
}
// Verify when the user is logged, if there is a change in the password
userSchema.methods.changedPasswordAfter = async function (JWTimestamp) {
    if (this.passwordChangeAt) {
        const changedTimestamp = parseInt(
            //Convert the time in seconds because the JWTTImestamp is in seconds too
            this.passwordChangeAt.getTime() / 1000,
            10
        )
        return JWTimestamp < changedTimestamp
    }
    return false
}
userSchema.methods.createConfirmAccountToken = function () {
    const tokenConfirm = crypto.randomBytes(32).toString('hex')
    this.confirmationToken = crypto
        .createHash('sha256')
        .update(tokenConfirm)
        .digest('hex')

    this.confirmationTokenExpires = Date.now() + 14440 * 60 * 1000;
    return tokenConfirm

}

userSchema.methods.verifyIfTheDateTokenPassed = function () {

    if (confirmationTokenExpires < Date.now() && !undefined) {
       this.createPasswordResetToken();
       return true
    }
    return;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.confirmationToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
    //Now + 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken
}
module.exports = mongoose.model('User', userSchema)