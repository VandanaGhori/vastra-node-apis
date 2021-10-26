const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    getProductTypes: async function (req,res) {
        let getProductTypesResponse = await db_operations.productType.getAllProductTypes("productType");
        if(getProductTypesResponse != false) {
            res.json(utils.sendResponse(true, 200, "All Product Types", getProductTypesResponse));
            return;
        } else {
            return res.json(utils.sendResponse(false, 500, "No Product Type Found!", []));
        }
    }
}