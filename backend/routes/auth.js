const express = require('express');
const authController = require('../controllers/auth')
const router = express.Router();
const protect = require('../middleware/is-auth')
router.post(
    '/signup',
    authController.signup
)

router.patch(
    '/confirm/:token',
    authController.confirm
)

router.post(
    '/login',
    authController.login
);


router.post(
    '/forgotPassword',
    authController.forgotPassword
)

router.post(
    '/changePassword/:token',
    authController.confirmRedefinition
)

router.post(
    '/updatePassword',
    protect,
    authController.updatePassword
)


router.patch(
    '/updateMe',
    protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe

)
module.exports = router