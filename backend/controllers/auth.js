const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/userDashboard');
const catchAsync = require('../utils/catchAsync')
const { validationResult } = require('express-validator')
const emailSendGrid = require('@sendgrid/mail');
require('dotenv').config()

emailSendGrid.setApiKey(process.env.SENDGRID_API_KEY)

exports.signup = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { email, name, password } = req.body

    const token = crypto.randomBytes(32).toString('hex');

    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
        email: email,
        password: hashedPw,
        name: name,
        isActive: false,
        confirmationToken: token,
        tokenExpires: expires
    })

    const result = await user.save();


    const confirmLink = `http://localhost:3000/confirm/${token}`
    const emailContent = {
        to: email,
        from: 'vitorvpio60@gmail.com',
        subject: 'Confirm your account!!!',
        text: confirmLink,
        html: confirmLink
    }
    await emailSendGrid
        .send(emailContent)
        .then(() => {
            console.log(`Email sent for ${email}`)
        })
        .catch((error) => {
            console.log(error)
        })

    res.status(201).json({
        message: `We sent the email for ${email} to confirm the account. `,
        userId: result._id
    })
})

exports.confirm = catchAsync(async (req, res, next) => {
    const token = req.params.token;
    console.log(token)
    const user = await User.findOne({ confirmationToken: token })
    console.log(user)
    if (!user) {
        const error = new Error("The user user with this token doesn't exist")
        error.statusCode = 401;
        throw error;
    }
    if (user.isActive) {
        throw new Error('The account was already confirmed!')
    }
    if (!user.confirmationToken) {
        throw new Error('The token was expired or already used!');
    }
    user.isActive = true;

    user.confirmationToken = undefined;
    user.tokenExpires = undefined

    await user.save();

    res.status(200).json({
        mensage: 'The account was confirmed!!!'
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    const isEqual = await bcrypt.compare(password, user.password);

    if (!user || !isEqual) {
        const error = new Error('The password/email is wrong')
        error.statusCode = 422;
        throw error;
    }
    const token = jwt.sign(
        { email: user.email, userId: user._id.toString() },
        process.env.TOKEN_JWT,
        { expiresIn: '1h' }
    );
    res.status(200).json({
        token: token,
        mensage: "Successful login",
        userId: user._id.toString()
    })
})
exports.passwordRedefinition = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    const email = req.body.email;
    console.log(email)

    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const user = await User.findOne({ email })

    if (!user) {
        const error = new Error("This Email doesn't exist!!!")
        error.statusCode = 401
        throw error
    }
    const token = crypto.randomBytes(32).toString('hex');

    const confirmLink = `http://localhost:3000/auth/changePassword/${token}`

    const emailContent = {
        to: email,
        from: 'vitorvpio60@gmail.com',
        subject: 'This is your link to change the password!!!',
        text: confirmLink,
        html: confirmLink
    }
    user.tokenRedefinition = token;

    await user.save();

    await emailSendGrid
        .send(emailContent)
        .then(() => {
            console.log(`Email sent for ${email}`)
        })
        .catch((error) => {
            console.log(error)
        })

    res.status(200)
        .json({
            mensage: "The link to change the password was sent!!!",
            status: 200
        })
})
exports.confirmRedefinition = catchAsync(async (req, res, next) => {
    const confirmToken = req.params.token;

    const { password } = req.body;
    console.log(confirmToken)
    const user = await User.findOne({ tokenRedefinition: confirmToken })

    if (!user) {
        const error = new Error("This Token doesn't exist!!!")
        error.statusCode = 401
        throw error
    }
    const hashedPw = await bcrypt.hash(password, 12);
    
    user.password = hashedPw;
    user.tokenRedefinition = undefined
    await user.save();

    res.status(200).json({
        mensage: 'The password was changed!!!'
    })
})