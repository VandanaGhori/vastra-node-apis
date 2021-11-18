const express = require('express');
var app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = 3000;
app.use(express.json())

// For image uploading
const path = require('path')
var fileUpload = require('express-fileupload');

// add reference of dir
app.use(express.static(path.join(__dirname, 'images')));
app.use(fileUpload());

var products = require("./controller/product.js");
var user = require("./controller/user.js");
var productInventory = require("./controller/product_inventory.js");
var fashionDesigner = require("./controller/fashion_designer.js");
var catalogue = require('./controller/catalogue.js');
var color = require('./controller/color.js');
var productType = require('./controller/product_type.js');
var material = require('./controller/material.js');
var productSize = require('./controller/product_size.js');
var image = require('./controller/uploadImage.js');
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

app.post('/product', function(req,res){
    products.createProduct(req,res)
})

app.get('/product/exist/fd', function(req,res) {
    products.isAnyProductExistForDesigner(req,res)
})

app.get('/product/fd/catalogue/list', function(req,res) {
    products.getCatalogueProducts(req,res)
})

app.delete('/product', function(req,res){
    products.deleteProduct(req,res)
})

app.get('/product/info', function(req,res) {
    products.getProduct(req,res)
})

app.post('/product/list', function(req, res) {
    products.getFilteredProducts(req, res)
})

app.put('/product', function(req,res){
    products.updateProduct(req,res)
})

app.get('/product/list/feed', function(req, res){
    products.getProductFeeds(req,res)
})

// ----------------UploadImage--------------------
app.post('/upload', function(req,res){
    image.uploadImage(req,res)
})

// --------------ProductSize---------------------
app.get('/product/size/list', function(req,res) {
    productSize.getProductSizes(req,res)
})

app.get('/product/customSize/list', function(req,res) {
    productSize.getCustomProductSizes(req,res)
})

app.put('/product/size/list', function(req,res){
    productSize.updateProductSizes(req,res)
})

// -----------------ProductType------------
app.get('/product/type/list', function(req,res){
    productType.getProductTypes(req,res)
})

app.get("/product/basiclist/fd/type", function(req,res){
    productType.getDesignerProductsByTypes(req,res)
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

app.get('/fd/user/list', function(req,res){
    fashionDesigner.getDesigners(req,res)
})

// -----------------Color------------------------
app.get('/color/list', function(req,res){
    color.getColors(req,res)
})

app.post('/product/color', function(req,res){
    color.addProductColor(req,res)
})

app.put('/product/color', function(req,res){
    color.updateProductColor(req,res)
})

app.delete('/product/color', function(req,res){
    color.deleteProductColor(req,res)
})

app.put('/product/color/list', function(req,res){
    color.updateProductColors(req,res)
})

// ------------------ProductInventory------------------
app.post('/product/inventory/list' , function(req,res){
    productInventory.addProductInventories(req,res)
})

app.put('/product/inventory/list' , function(req,res){
    productInventory.updateProductInventories(req,res)
})

// -----------------Login---------------------------
app.post('/login', function(req,res) {
    user.login(req,res)
})

// ------------------Logout-------------------------
app.delete('/logout', function(req,res) {
    user.logout(req,res)
})

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
})

