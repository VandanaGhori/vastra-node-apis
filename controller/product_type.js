const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    getProductTypes: async function (req,res) {
        let getProductTypesResponse = await db_operations.productType.getAllProductTypes("producttype");
        if(getProductTypesResponse != false) {
            res.json(utils.sendResponse(true, 200, "All Product Types", getProductTypesResponse));
            return;
        } else {
            return res.json(utils.sendResponse(true, 200, "No Product Type Found", []));
        }
    },
    getDesignerProductsByTypes: async function (req,res) {
        input = req.query;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
    
        if (validateTokenResult != false) {
            if(input.designerId == null || input.productTypeId == null) {
                res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                return;
            }

            let getDesignerProductsByTypesResponse = await db_operations.productType.getDesignerProductsByTypes(input.designerId, input.productTypeId);
            //console.log("Response " + JSON.stringify(getDesignerProductsByTypesResponse));
            if(getDesignerProductsByTypesResponse != false) {
                //console.log("Response " + getDesignerProductsByTypesResponse[0]['images']);
                return res.json(utils.sendResponse(true, 200, "List of Products", getDesignerProductsByTypesResponse));
            } else {
                return res.json(utils.sendResponse(true, 200, "No Products are Found", []));
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }
    }
}