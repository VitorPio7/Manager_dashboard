const express = require('express');
const { body } = require('express-validator')
const User = require('../model/userDashboard');
const authController = require('../controllers/auth')
const router = express.Router();

router.put(
    '/signup',
    [
        body('email')
            .escape()
            .notEmpty()
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom(async value => {
                const userFind = await User.findOne({ email: email });
                if (userFind) {
                    throw new Error('E-mail already in use')
                }
            })
            .normalizeEmail(),
        body('password')
            .escape()
            .trim()
            .isLength({ min: 5, max: 16 })
            .withMessage('The password has to be minimum of 5 and maximum 16 words, numbers or symbols.')
            .isStrongPassword(),
        body('name')
            .escape()
            .isString()
            .notEmpty()
            .isLength({ min: 3, max: 30 })
            .withMessage('The name has to be minimum of 3 and maximum 30 words')
    ],
    authController.signup
)
module.exports = router