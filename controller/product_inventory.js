const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    addProductInventories: async function (req, res) {
        input = req.body;
        token = req.headers['token'];

        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "User is not authorized!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {
            if (input == null) {
                res.json(utils.sendResponse(false, 500, "Invalid request."));
                return;
            }

            let addProductInventoriesResponse = await db_operations.productInventory.addProductInventories("productinventory", input);

            if (addProductInventoriesResponse != false) {
                res.json(utils.sendResponse(true, 200, "Inventories inserted successfully."))
                return;
            } else {
                res.json(utils.sendResponse(false, 500, "Inventories are not inserted."))
                return;
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }
    },
    updateProductInventories: async function (req, res) {
        input = req.body;
        token = req.headers['token'];

        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }

        if (input == null) {
            res.json(utils.sendResponse(false, 500, "Invalid request."));
            return;
        }

        if (input.productId == null || input.inventories == null) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        if (input.inventories.length == 0) {
            return res.json(utils.sendResponse(false, 404, "Product should have one or more inventories"));
        }

        let existingInventories = await db_operations.productInventory.getProductInventories(input.productId);
        await Promise.all(existingInventories.map(async (existingProductInventory) => {
            var isDeleted = true;
            input.inventories.map((updateProductInventory) => {
                if (existingProductInventory.id == updateProductInventory.id) {
                    isDeleted = false;
                }
            })
            if (isDeleted) {
                // delete inventories -> set isdeleted
                await db_operations.productInventory.deleteProductInventory(existingProductInventory.id);
            }
        }))

        await Promise.all(input.inventories.map(async (productInventory) => {
            if (productInventory.id == 0) {
                // create new
                await db_operations.productInventory.addProductInventory(productInventory)
            } else {
                let existingProductInventory = await db_operations.productInventory.getProductInventoryById(productInventory.id);
                if (existingProductInventory == null) {
                    // create new
                    await db_operations.productInventory.addProductInventory(productInventory)
                } else {
                    // update
                    await db_operations.productInventory.updateProductInventory(productInventory)
                }
            }
        }))

        let productInventories = await db_operations.productInventory.getProductInventories(input.productId);
        return res.json(utils.sendResponse(true, 200, "Product inventories are updated", productInventories));
    }
}