const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');
var crypto = require('crypto'); 
const fs = require('fs');
const fileUpload = require("express-fileupload");
const path = require('path');

module.exports = {
    uploadImage: async function (req, res) {
        token = req.headers['token'];

        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"));
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);

        if (validateTokenResult != false) {
            let success = false;
            if (!req.files) {
                return res.json(utils.sendResponse(false, 500, "File is not uploaded"));
            }

            let imagesMimeRegex = new RegExp("image/(.*)");

            let file = req.files.file;
            
            if (imagesMimeRegex.test(file.mimetype)) {
                
                var fileName = crypto.randomBytes(15).toString('hex');
                var extension = path.extname(file.name);

                //path generation for local stroed image file
                let fileUpload = `./images/` + fileName + extension;
                try {
                    await file.mv(fileUpload);
                    success = true;
                } catch (err) {
                    console.log(err);
                }
             
                if (success) {
                    if (fs.existsSync(fileUpload)) {
                        return res.json(utils.sendResponse(true, 200, "User has successfully uploaded file", fileName + extension));
                    } else {
                        return res.json(utils.sendResponse(false, 500, "File is not successfully uploaded."));
                    }
                } else {
                    return res.json(utils.sendResponse(false, 500, "Oops! Something went wrong"));
                }

            } else {
                return res.json(utils.sendResponse(false, 500, "Only Image files are allowed"));
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }
    }
}