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
    body("imageUrl").custom((value, { req }) => {
        if (!value && !req.file) {
            throw new Error("Please provide an image!");
        }
        return true;
    })
], productsController.createProduct);


router.get("/:product", isAuth, [
    param("product")
        .notEmpty()
        .withMessage("Please, send the id of the product!!!")
], productsController.getProduct)


router.patch("/:product", isAuth, [
    param("product")
        .notEmpty()
        .withMessage("Please, send the id of the product!!!"),
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
    body("imageUrl").custom((value, { req }) => {
        if (!value && !req.file) {
            throw new Error("Please provide an image!");
        }
        return true;
    })

], productsController.updateProduct);
module.exports = router;