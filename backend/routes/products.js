const express = require('express');
const { body, param } = require('express-validator')
const Products = require('../model/products');
const productsController = require('../controllers/products')
const isAuth = require('../middleware/is-auth');
const router = express.Router();
router.get("/", isAuth, productsController.getAllProducts);
router.post("/createProduct", isAuth, [
    body("title")
        .notEmpty()
        .isString()
        .escape()
        .withMessage('Please enter a valid name!!!'),
    body("price")
        .notEmpty()
        .isNumeric()
        .escape()
        .withMessage("Please enter a valid price!!!"),
    body("quantity")
        .notEmpty()
        .isInt()
        .escape()
        .withMessage("Please enter a valid quantity!!!"),
    body("imageUrl")
        .notEmpty()
        .escape()
        .withMessage("Please enter a valid image!!!")
] ,productsController.createProduct)
module.exports = router;