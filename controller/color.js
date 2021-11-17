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
            if (updateProductColorResponse != false) {
                let getProductColorByIdResponse = await db_operations.color.getUpdatedProductColorById("productcolor", input.id, input.productId);
                if (getProductColorByIdResponse == false) {
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
    deleteProductColor: async function (req, res) {
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
            if (deleteProductColorResponse == false) {
                return res.json(utils.sendResponse(false, 500, "Product color is not deleted."));
            }
            return res.json(utils.sendResponse(true, 200, "Product color is deleted successfully."));
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }
    },
    updateProductColors: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        if (input.productId == null || input.productColors == null) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        if (input.productColors.length == 0) {
            return res.json(utils.sendResponse(false, 404, "Product should have one or more colors"));
        }

        await Promise.all(input.productColors.map(async (productColor) => {
            if (productColor.prominentColorId == null) {
                return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            }
            productColor.productId = input.productId;
        }))

        let existingColors = await db_operations.productColors.getAllProductColors(input.productId);
        await Promise.all(existingColors.map(async (existingProductColor) => {
            var isDeleted = true;
            input.productColors.map((updateProductColor) => {
                if (existingProductColor.id == updateProductColor.id) {
                    isDeleted = false;
                }
            })
            if (isDeleted) {
                // delete inventories -> set isdeleted
                let deleteInventoriesRes = await db_operations.productInventory.deleteProductColorInventories(existingProductColor.id);
                if (deleteInventoriesRes != false) {
                    // delete product color -> set isdeleted
                    await db_operations.productColors.deleteProductColor(existingProductColor.id);
                }
            }
        }))

        await Promise.all(input.productColors.map(async (productColor) => {
            if (productColor.id == 0) {
                // create new
                await db_operations.productColors.addProductColor(input.productId, productColor)
            } else {
                let existingProductColor = await db_operations.productColors.getProductColorById(productColor.id);
                if (existingProductColor == null) {
                    // create new
                    await db_operations.productColors.addProductColor(input.productId, productColor)
                } else {
                    // update
                    await db_operations.productColors.updateProductColor(productColor)
                }
            }
        }))

        let productColors = await db_operations.productColors.getAllProductColors(input.productId);
        return res.json(utils.sendResponse(true, 200, "Product colors are updated", productColors));
    },
}
