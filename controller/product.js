const db_operations = require("../db_operations");
var utils = require('../utils');
var multer = require('multer');

module.exports = {
    getAllProducts: async function (req, res) {
        let productResponse = await db_operations.product.getAllProducts("product");
        if(productResponse != false) {
            res.json(utils.sendResponse(false, 200, "All the Products", productResponse));
            return;
        }
        return res.json(utils.sendResponse(false, 200, "Oops!", []));
    },
    uploadImage: async function (req,res) {
        token = req.headers['token'];

        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {
            // if (input.material == null) {
            //     res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            //     return;
            // }
            return res.json(utils.sendResponse(false, 200, "User is authenticated!"));
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }
    },
    createProduct: async function (req,res) {
        input = req.body;
        
    }
};