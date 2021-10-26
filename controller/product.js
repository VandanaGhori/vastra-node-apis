const db_operations = require("../db_operations");
var utils = require('../utils');
var crypto = require('crypto');
const fs = require('fs');

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
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {
            // if (input.material == null) {
            //     res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            //     return;
            // }
            
            let success = false;

            if (!req.files) {
                return res.json(utils.sendResponse(false, 500, "No files were uploaded!"));
            }

            const imagesMimeRegex = new RegExp("image/(.*)");
            if (req.files) {
                let file = req.files.file;
                console.log("File " + file.name);
                //if(file.mimetype == "image/jpeg" || file.mimetype == 'image/png')
                if (imagesMimeRegex.test(file.mimetype)) {
                    var nameExtra = crypto.randomBytes(15).toString('hex');
                    let fileUpload = `./productImage/` + nameExtra + file.name;
                    try {
                        await file.mv(fileUpload);
                        success = true;
                    } catch (err) {
                        console.log(err);
                    }
                    if(fs.existsSync(fileUpload)) {
                        //console.log("File path Exist into local folder.");

                        // Store image into the database and return the file path in json response
                        let uploadFileResponse = await db_operations.product.uploadProductImage("product", fileUpload);
                        if(uploadFileResponse != false) {
                            
                        }
                    } else {
                        success = false;
                    }
                }
                if (success)
                    return res.json(utils.sendResponse(true, 200, "User has successfully uploaded file!", success));
                else
                    return res.json(utils.sendResponse(false, 500, "User failed to upload file!", success));
            } else {
                return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
            }
        }
    },
    createProduct: async function (req, res) {
        input = req.body;
    }
};