const express = require('express');

const productsController = require('../controllers/products')

const isAuth = require('../middleware/is-auth');

const router = express.Router();


router.get("/",
    isAuth.protect,
    productsController.productsQueries,
    productsController.getAllProducts
);

//Limpar essas rotas
router.post("/createProduct",
    isAuth.protect,
    productsController.createProduct
);

router.route("/:id")
    .get(
        isAuth.protect,
        productsController.getProduct
    )
    .patch(
        isAuth.protect,
        productsController.uploadTourImages,
        productsController.resizeProductImages,
        productsController.updateProduct
    )
    .delete(
        isAuth.protect,
        productsController.deleteProduct
    )

module.exports = router;