const { json } = require("express");
const db_operations = require("../db_operations");

module.exports = {
    createCatalogue: function (req,res) {
        input = req.body;
        token = req.headers['token'];
        if(token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!!!"))
        }
        db_operations.validate.validateToken(token, function (err, response){
            if (err) {
                res.json(utils.sendResponse(false, 500, "Opps something went wrong!"))
            } 
            if (response[0]['sessionToken'] == 1) {
                if (input.name == null) {
                    res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                    return;
                }
                db_operations.validate.getUserIdFromToken(token, function (err, response){
                    if (err) {
                        res.json(utils.sendResponse(false, 500, "Opps something went wrong!"))
                    }
                    userId = response[0]['userId'];
                    let catalogue = {
                        'name' : input.name,
                        'designerId' : userId
                    }
                    //console.log("ID " + userId);     
                })
            } else {
                res.json(utils.sendResponse(false, 500, "User is not authorized!!!"));
            }
        })
    }
}