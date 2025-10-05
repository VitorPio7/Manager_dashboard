const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/userDashboard');
const catchAsync = require('../utils/catchAsync')
const { validationResult } = require('express-validator')

exports.signup = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
       const error = new Error('Validation failed.');
       error.statusCode = 422;
       error.data = errors.array();
       throw error;
    }
    const { email, name, password } = req.body.password
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
        email: email,
        password: hashedPw,
        name: name
    })
    const result = await user.save();
    res.status(201).json({
        message: 'User created!',
        userId: result._id
    })
})