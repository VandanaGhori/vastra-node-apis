const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    getMaterials : async function(req,res) {
        let getMaterialsResponse = await db_operations.material.getAllMaterials("material");
        if(getMaterialsResponse != false) {
            res.json(utils.sendResponse(true, 200, "All Materials", getMaterialsResponse));
            return;
        } else {
            return res.json(utils.sendResponse(false, 500, "Opps!!", []));
        }
    },
    createMaterial : async function(req,res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {
            if (input.material == null) {
                res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                return;
            }
            let materialExist = await db_operations.material.isMaterialExist("material", input.material);
            if (materialExist['noOfMaterialExist'] > 0) {
                res.json(utils.sendResponse(false, 500, "Material is already exist!"));
                return;
            }

            let addMaterialResponse = await db_operations.material.addMaterial("material",input.material);
            if(addMaterialResponse != false) {
                let getMaterialByIdResponse = await db_operations.material.getMaterialById("material", addMaterialResponse.insertId);
                //console.log("Recently added material ID = " + addMaterialResponse.insertId);
                if (getMaterialByIdResponse != false) {
                    return res.json(utils.sendResponse(true, 200, "Catalogue created!", getMaterialByIdResponse));
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