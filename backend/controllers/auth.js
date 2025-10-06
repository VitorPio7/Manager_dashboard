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
        text: confirmLink
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

    await user.save();

    res.status(200).json({
        mensage: 'The account was confirmed!!!'
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { email, password } = req.body;
})