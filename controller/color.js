const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    getColors: async function (req, res) {
        let getColorsResponse = await db_operations.color.getAllColors("color");
        if (getColorsResponse != false) {
            res.json(utils.sendResponse(true, 200, "All Colors", getColorsResponse));
            return;
        } else {
            return res.json(utils.sendResponse(false, 500, "Opps something went wrong"));
        }
    },
    addProductColor: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);

        if (validateTokenResult != false) {
            if (input.productId == null || input.prominentColorId == null) {
                res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                return;
            }
            let addColorValues = {
                "productId": input.productId,
                "prominentColorId": input.prominentColorId,
                "secondaryColorId": input.secondaryColorId ? input.secondaryColorId : null,
                "thirdColorId": input.thirdColorId ? input.thirdColorId : null
            }
            //console.log("AddColorValues = " + JSON.stringify(addColorValues));
            let values = Object.values(addColorValues);
            //console.log("After AddColorValues = " + values);
            let addProductColorResponse = await db_operations.color.addProductColor("productcolor", values);
            if (addProductColorResponse != false) {
                let getProductColorByIdResponse = await db_operations.color.getProductColorById("productcolor", addProductColorResponse.insertId);
                if (getProductColorByIdResponse != false) {
                    return res.json(utils.sendResponse(true, 200, "Product color is added.", getProductColorByIdResponse));
                } else {
                    return res.json(utils.sendResponse(false, 500, "Product color does not found."));
                }
            } else {
                return res.json(utils.sendResponse(false, 500, "Product color is not added."));
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }
    },
    updateProductColor: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);

        if (validateTokenResult != false) {
            if (input.id == null || input.productId == null || input.prominentColorId == null) {
                res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                return;
            }
            let updateProductColor = {
                "prominentColorId": input.prominentColorId,
                "secondaryColorId": input.secondaryColorId ? input.secondaryColorId : null,
                "thirdColorId": input.thirdColorId ? input.thirdColorId : null
            }
            let updateProductColorResponse = await db_operations.color.updateProductColor
            ("productcolor", updateProductColor, input.id, input.productId);
            //console.log("Update ProductColor Repsonse = " + JSON.stringify(updateProductColorResponse));
            if(updateProductColorResponse != false) {
                let getProductColorByIdResponse = await db_operations.color.getUpdatedProductColorById("productcolor", input.id, input.productId);
                if(getProductColorByIdResponse == false) {
                    return res.json(utils.sendResponse(false, 500, "Product color does not updated."));
                }
                return res.json(utils.sendResponse(true, 200, "Product color is updated.", getProductColorByIdResponse));
            } else {
                return res.json(utils.sendResponse(false, 500, "Product color is not updated."));
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }
    },
    deleteProductColor: async function (req,res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);

        if (validateTokenResult != false) {
            if (input.id == null) {
                res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                return;
            }
            let deleteProductColorResponse = await db_operations.color.deleteProductColor("productcolor", input.id);
            if(deleteProductColorResponse == false) {
                return res.json(utils.sendResponse(false, 500, "Product color is not deleted."));
            }
            return res.json(utils.sendResponse(true, 200, "Product color is deleted successfully."));            
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }
    }
}
