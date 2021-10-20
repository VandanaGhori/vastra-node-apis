const express = require('express');
var app = express();
const port = 3000;
app.use(express.json())

var products = require("./controller/product.js");
var user = require("./controller/user.js");

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

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
})

