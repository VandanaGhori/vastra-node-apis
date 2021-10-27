const db_operations = require("../db_operations");
var utils = require('../utils');


module.exports = {
    getAllProducts: async function (req, res) {
        let productResponse = await db_operations.product.getAllProducts("product");
        if (productResponse != false) {
            res.json(utils.sendResponse(false, 200, "All the Products", productResponse));
            return;
        }
        return res.json(utils.sendResponse(false, 500, "Oops something went wrong"));
    },    
    createProduct: async function (req, res) {
        input = req.body;
    }
};