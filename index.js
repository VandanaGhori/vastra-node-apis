const express = require('express');
var app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = 3000;
app.use(express.json())

var products = require("./controller/product.js");
var user = require("./controller/user.js");
var fashionDesigner = require("./controller/fashion_designer.js");
var catalogue = require('./controller/catalogue.js');
var color = require('./controller/color.js');
var productType = require('./controller/product_type.js');
var material = require('./controller/material.js');
var productSize = require('./controller/product_size.js');
const utils = require('./utils.js');

// Creating routing

// -----------------Test router----------------
app.get('/', function(req,res) {
    res.send('Get request to home page')
})

// -----------------Catalogue------------------
app.post('/catalogue', function(req,res){
    catalogue.createCatalogue(req,res)
})

app.get('/catalogue/list', function(req,res){
    catalogue.getCatalogues(req,res)
})

// -----------------Products-------------------
app.get('/product', function(req,res) {
    products.getAllProducts(req,res)
})

// ----------------UploadImage--------------------
app.post('/upload', function(req,res){
    products.uploadImage(req,res)
})

// --------------ProductSize---------------------
app.get('/product/size/list', function(req,res) {
    productSize.getProductSizes(req,res)
})


// Pending to implement
app.post('/product', function(req,res){
    products.createProduct(req,res)
})

// -----------------ProductType------------
app.get('/product/type/list', function(req,res){
    productType.getProductTypes(req,res)
})

// ----------------Material-------------
app.get('/material/list', function(req,res) {
    material.getMaterials(req,res)
})

app.post('/material', function(req,res){
    material.createMaterial(req,res)
})

// -----------------Shopper/User----------------
app.post('/user', function(req,res) {
    user.addNewUser(req,res)
})

app.post('/login', function(req,res) {
    user.login(req,res)
})

app.put('/user', function(req,res){
    user.updateShopper(req,res)    
})

// -----------------FashionDesigner-------------
app.post('/fd/user', function(req,res) {
    fashionDesigner.addNewFashionDesigner(req,res)
})

app.put('/fd/user', function(req,res){
    fashionDesigner.updateFashionDesigner(req,res)
})

// -----------------Color------------------------
app.get('/color/list', function(req,res){
    color.getColors(req,res)
})

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
})

