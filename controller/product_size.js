const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    getCustomProductSizes: async function (req, res) {
        let getAllCustomProductSizesResponse = await db_operations.productSize.getAllCustomProductSizes("productsize");
        if (getAllCustomProductSizesResponse.length > 0) {
            //const productSizes = Object.keys(getAllProductSizesResponse);
            const sizesArray = [];
            for (var i = 0; i < getAllCustomProductSizesResponse.length; i++) {
                sizesArray.push(getAllCustomProductSizesResponse[i]['customSize']);
            }
            return res.json(utils.sendResponse(true, 200, "All the custom product sizes", sizesArray));
        } else {
            return res.json(utils.sendResponse(false, 500, "Opps something went wrong with custom sizes"));
        }
    },
    getProductSizes: async function (req, res) {
        input = req.query;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {
            if (input.designerId == null || input.productId == null) {
                res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                return;
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }

        let getAllProductSizesResponse = await db_operations.productSize.getAllProductSizes("productsize", input.designerId, input.productId);
        if (getAllProductSizesResponse != false) {
            return res.json(utils.sendResponse(true, 200, "All the sizes", getAllProductSizesResponse));
        } else {
            return res.json(utils.sendResponse(true, 200, "Sizes are not found.", []));
        }
    },
    updateProductSizes: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        if (input.productId == null || input.productSizes == null) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        if (input.productSizes.length == 0) {
            return res.json(utils.sendResponse(false, 404, "Product should have one or more sizes"));
        }

        var isParameterMissing = false;
        await Promise.all(input.productSizes.map(async (productSize) => {
            if (productSize.brandSize == null && productSize.customSize == null) {
                isParameterMissing = true;
                return;
            }
            productSize.productId = input.productId;
        }))
        if (isParameterMissing) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        let existingSizes = await db_operations.productSizes.getAllProductSizes(input.productId);
        await Promise.all(existingSizes.map(async (existingProductSize) => {
            var isDeleted = true;
            input.productSizes.map((updateProductSize) => {
                if (existingProductSize.id == updateProductSize.id) {
                    isDeleted = false;
                }
            })
            if (isDeleted) {
                // delete inventories -> set isdeleted
                let deleteInventoriesRes = await db_operations.productInventory.deleteProductSizeInventories(existingProductSize.id);
                if (deleteInventoriesRes != false) {
                    // delete product size -> set isdeleted
                    await db_operations.productSizes.deleteProductSize(existingProductSize.id);
                }
            }
        }))

        await Promise.all(input.productSizes.map(async (productSize) => {
            if (productSize.id == 0) {
                // create new
                await db_operations.productSizes.addProductSize(input.productId, productSize)
            } else {
                let existingProductSize = await db_operations.productSizes.getProductSizeById(productSize.id);
                if (existingProductSize == null) {
                    // create new
                    await db_operations.productSizes.addProductSize(input.productId, productSize)
                } else {
                    // update
                    await db_operations.productSizes.updateProductSize(productSize)
                }
            }
        }))

        let productSizes = await db_operations.productSizes.getAllProductSizes(input.productId);
        return res.json(utils.sendResponse(true, 200, "Product sizes are updated", productSizes));
    },
}