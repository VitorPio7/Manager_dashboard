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
    authController.confirm)
router.post(
    '/login',
    authController.login);
router.post(
    '/changePassword',
    authController.passwordRedefinition)

router.post(
    '/changePassword/:token',
    authController.confirmRedefinition)
router.post(
    '/updatePassword',
    protect,
    authController.updatePassword
)
module.exports = router