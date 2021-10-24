const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');


// Name and designer Id in body and token in header
module.exports = {
    createCatalogue: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);

        if (validateTokenResult != false) {
            if (input.name == null || input.designerId == null) {
                res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                return;
            }

            let catalogueExist = await db_operations.catalogue.isCatalogueExist("catalogue", input.name, input.designerId);
            //console.log("CatalogueExist = " + catalogueExist['noOfCatalogueExist']);
            if(catalogueExist['noOfCatalogueExist'] > 0) {
                res.json(utils.sendResponse(false, 500, "Catalogue is already exist!"));
                return;
            }

            let catalogue = {
                'name': input.name,
                'designerId': input.designerId
            }
            var catalogueObj = Object.values(catalogue);
            let addCatalogueResponse = await db_operations.catalogue.addCatalogue("catalogue", catalogueObj);
            if(addCatalogueResponse != false) {
                let getCatalogueByIdResponse = await db_operations.catalogue.getCatalogueById("catalogue", addCatalogueResponse.insertId);
                if(getCatalogueByIdResponse != false) {
                    return res.json(utils.sendResponse(true, 200, "Catalogue created!", getCatalogueByIdResponse));
                } else {
                    return res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                }
            } else {
                return res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }
    }
}