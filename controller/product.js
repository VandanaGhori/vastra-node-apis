const db_operations = require("../db_operations");
var utils = require('../utils');
var crypto = require('crypto'); 
const fs = require('fs');
const fileUpload = require("express-fileupload");
const path = require('path');
const { json } = require("body-parser");

module.exports = {
    getAllProducts: async function (req, res) {
        let productResponse = await db_operations.product.getAllProducts("product");
        if (productResponse != false) {
            res.json(utils.sendResponse(false, 200, "All the Products", productResponse));
            return;
        }
        return res.json(utils.sendResponse(false, 200, "Oops!", []));
    },
    uploadImage: async function (req, res) {
        token = req.headers['token'];

        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"));
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);

        if (validateTokenResult != false) {
            let success = false;
            if (!req.files) {
                return res.json(utils.sendResponse(false, 500, "No files were uploaded!"));
            }

            let imagesMimeRegex = new RegExp("image/(.*)");

            let file = req.files.file;
            
            if (imagesMimeRegex.test(file.mimetype)) {
                var nameExtra = crypto.randomBytes(15).toString('hex');
                //path generation for local stroed image file
                let fileUpload = `./Images/` + nameExtra + file.name;
                try {
                    await file.mv(fileUpload);
                    success = true;
                } catch (err) {
                    console.log(err);
                }
             
                if (success) {
                    if (fs.existsSync(fileUpload)) {
                        let uploadedFilePath = process.cwd() + "\\Images\\" + nameExtra + file.name;
                        //console.log("Path " + uploadedFilePath);
                        let result = uploadedFilePath.replace(/\\/g, '\/');
                        return res.json(utils.sendResponse(true, 200, "User has successfully uploaded file!", result));
                    } else {
                        return res.json(utils.sendResponse(false, 500, "File does not store!"));
                    }
                } else {
                    return res.json(utils.sendResponse(false, 500, "Oops! Something went wrong!"));
                }

            } else {
                return res.json(utils.sendResponse(false, 500, "Only Image files are allowed!"));
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }
    },
    createProduct: async function (req, res) {
        input = req.body;
    }
};