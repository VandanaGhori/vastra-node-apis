const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    createCatalogue: function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!!!"))
        }
        db_operations.validate.validateToken(token, function (err, response) {
            if (err) {
                res.json(utils.sendResponse(false, 500, "Opps something went wrong!----1"))
            }
            if (response[0]['sessionToken'] == 1) {
                if (input.name == null) {
                    res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                    return;
                }
                db_operations.validate.getUserIdFromToken(token, function (err, response) {
                    if (err) {
                        res.json(utils.sendResponse(false, 500, "Opps something went wrong!----2"))
                    }
                    userId = response[0]['userId'];
                    db_operations.fashionDesigner.getDesignerIdFromUserId(userId, function (err, response) {
                        if (err) {
                            res.json(utils.sendResponse(false, 500, "Opps something went wrong!----3"))
                        }
                        designerId = response[0]['id'];
                        let catalogue = {
                            'name': input.name,
                            'designerId': designerId
                        }
                        var catalogueObj = Object.values(catalogue)
                        db_operations.catalogue.addCatalogue("catalogue", catalogueObj, function (err, response) {
                            if (err) {
                                res.json(utils.sendResponse(false, 500, "Opps something went wrong!-----4"));
                            } else {
                                console.log(response.insertId);
                                db_operations.catalogue.getCatalogueById("catalogue", response.insertId, function (err, catalogueResponse) {
                                    if (err) {
                                        res.json(utils.sendResponse(false, 500, "Opps something went wrong!-----5"));
                                    } else {
                                        res.json(utils.sendResponse(true, 200, "Catalogue created!", catalogueResponse[0]));
                                    }
                                })
                            }
                        })
                    })
                })
            } else {
                res.json(utils.sendResponse(false, 403, "User is not authorized!!!"));
            }
        })
    }
}