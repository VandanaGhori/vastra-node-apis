const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    /*getProductSizes : async function(req,res) {
        input = req.query;
        // token = req.headers['token'];
        // if (token == null) {
        //     return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        // }

        // let validateTokenResult = await db_operations.validate.validateToken(token);
        // if (validateTokenResult != false) {
        //     if (input.material == null) {
        //         res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        //         return;
        //     }
        // }  else {
        //     return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        // }

        if(input.designerId == null || input.productTypeId == null) {
            res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        } 

        let getAllProductSizesResponse = await db_operations.productSize.getAllProductSizes("productsize", input.designerId, input.productTypeId);
        if(getAllProductSizesResponse != false) {
            //const productSizes = Object.keys(getAllProductSizesResponse);
            const sizesArray = [];
            for(var i = 0 ; i < getAllProductSizesResponse.length ; i++) {
                sizesArray.push(getAllProductSizesResponse[i]['brandSize']);
            }
            return res.json(utils.sendResponse(true, 200, "All the product sizes", sizesArray));
        } else {
            return res.json(utils.sendResponse(false, 500, "Opps something went wrong"));
        }
    }*/
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