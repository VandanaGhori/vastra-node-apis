const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    getCustomProductSizes : async function(req,res) {
        let getAllCustomProductSizesResponse = await db_operations.productSize.getAllCustomProductSizes("productsize");
        if(getAllCustomProductSizesResponse.length > 0) {
            //const productSizes = Object.keys(getAllProductSizesResponse);
            const sizesArray = [];
            for(var i = 0 ; i < getAllCustomProductSizesResponse.length ; i++) {
                sizesArray.push(getAllCustomProductSizesResponse[i]['customSize']);
            }
            return res.json(utils.sendResponse(true, 200, "All the custom product sizes", sizesArray));
        } else {
            return res.json(utils.sendResponse(false, 500, "Opps something went wrong with custom sizes"));
        }
    },
    getProductSizes : async function(req,res) {
        input = req.query;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {
            if(input.designerId == null || input.productId == null) {
                res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                return;
            }
        }  else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }

        let getAllProductSizesResponse = await db_operations.productSize.getAllProductSizes("productsize", input.designerId, input.productId);
        if(getAllProductSizesResponse != false) {
            return res.json(utils.sendResponse(true, 200, "All the sizes", getAllProductSizesResponse));
        } else {
            return res.json(utils.sendResponse(true, 200, "Sizes are not found.", []));
        }
    }
}