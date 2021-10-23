const express = require('express');
var app = express();
const port = 3000;
app.use(express.json())

var products = require("./controller/product.js");
var user = require("./controller/user.js");
var fashionDesigner = require("./controller/fashion_designer");
const utils = require('./utils.js');

// Creating routing

// -----------------Test router----------------
app.get('/', function(req,res) {
    res.send('Get request to home page')
})

// -----------------Products-------------------
app.get('/products', function(req,res) {
    products.getAllProducts(req,res)
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

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
})

