const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    addProductInventories: async function (req,res) {
        input = req.body;
        token = req.headers['token'];

        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {  
            if(input == null) {
                res.json(utils.sendResponse(false, 500, "Invalid request."));  
                return;  
            }
    
            let addProductInventoriesResponse = db_operations.productInventory.addProductInventories("productinventory", input);
    
            if(addProductInventoriesResponse != false) {
                res.json(utils.sendResponse(true, 200, "Inventories inserted successfully."))
                return;
            } else {
                res.json(utils.sendResponse(false, 500, "Inventories are not inserted."))
                return;
            }
        }  else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }      
    },
    updateProductInventories: async function (req,res) {
        input = req.body;
        token = req.headers['token'];

        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {  
            if(input == null) {
                res.json(utils.sendResponse(false, 500, "Invalid request."));  
                return;  
            }

            let updateProductInventoriesResponse = db_operations.productInventory.updateProductInventories("productinventory", input);

            if(updateProductInventoriesResponse != false) {
                res.json(utils.sendResponse(true, 200, "Inventories are updated successfully."))
                return;
            } else {
                res.json(utils.sendResponse(false, 500, "Inventories are not updated."))
                return;
            }

        }  else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }    
    }
}