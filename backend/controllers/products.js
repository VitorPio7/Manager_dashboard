const catchAsync = require('../utils/catchAsync')
const Products = require('../model/products');
const User = require('../model/userDashboard');
const { validationResult } = require('express-validator');
const path = require("path");
const fs = require("fs");
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.productsQueries = function (req, res, next) {
   const query = {};
   req.query.category ? query.category = req.query.category : null;
   next()
}

exports.getAllProducts = handlerFactory.getAll(Products);

exports.createProduct = catchAsync(async (req, res, next) => {
   if (!req.file) {
      return next(AppError('No image provided', 422));
   }
   const { title, price, quantity, category } = req.body
   if (title || price || quantity || category) {
      return next(AppError('You need to pass all the information', 400))
   }
   const imageUrl = req.file.path;
   const product = new Products({
      title,
      price,
      quantity,
      category,
      imageUrl,
      creator: req.userId
   })

   await product.save()

   const user = await User.findById(req.userId)

   user.products.push(product);

   await user.save();


   res.status(201).json({
      message: 'Product created',
      data: product
   })
})
exports.getProduct = catchAsync(async (req, res, next) => {
   const idProduct = req.params.product;
   console.log(idProduct)
   const findProduct = await Products.findById(idProduct);
   if (!findProduct) {
      const error = new Error("There's no product with this id!!!");
      error.statusCode = 404;
      throw error;
   }
   res.status(201).json({
      message: 'Data succesfully loaded!!!',
      data: findProduct
   })
})
exports.updateProduct = catchAsync(async (req, res, next) => {

   const postId = req.params.product;

   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
   }
   const { title, price, quantity, category } = req.body;

   let imageUrl = req.body.imageUrl;

   if (req.file) {
      imageUrl = req.file.path;
   }

   const findProduct = await Products.findById(postId).populate('creator');

   if (!findProduct) {
      const error = new Error('Could not find the product with this id!!!')
      error.statusCode = 404;
      throw error;
   }
   if (findProduct.creator._id.toString() !== req.userId) {
      const error = new Error("You're not authorized to update this product!!!")
      error.statusCode = 403;
      throw error;
   }
   if (imageUrl !== findProduct.imageUrl) {
      filePath = path.join(__dirname, '..', findProduct.imageUrl);
      fs.unlink(filePath, err => console.log(err));
   }

   findProduct.title = title;

   findProduct.imageUrl = imageUrl;

   findProduct.price = price;

   findProduct.quantity = quantity;

   findProduct.category = category;

   const myProduct = await findProduct.save();

   res.status(200).json({
      message: 'Product updated!',
      post: myProduct
   })
})
exports.deleteProduct = catchAsync(async (req, res, next) => {

   const productId = req.params.product;

   const findProductId = await Products.findById(productId);

   if (!findProductId) {
      const error = new Error("There is no product with this id!!!")
      error.statusCode = 404;
      throw error;
   }

   if (findProductId.creator._id.toString() !== req.userId) {
      const error = new Error("You are not authorized to delete!!!")
      error.message = 403
      throw error;
   }

   await Products.findByIdAndDelete(productId);

   filePath = path.join(__dirname, '..', findProductId.imageUrl);

   fs.unlink(filePath, err => console.log(err));

   const user = await User.findById(req.userId);

   user.products.pull(productId);

   await user.save();

   res.status(200).json({
      message: 'Post deleted!!!'
   })
})