const { json } = require("express");
const db_operations = require("../db_operations");
const md5 = require('md5');
var crypto = require('crypto');
var utils = require('../utils');

module.exports = {
    addNewFashionDesigner: function (req, res) {
        input = req.body;
        if (input.email == null || input.password == null || input.firstName == null ||
            input.lastName == null || input.address == null || input.city == null || input.province == null
            || input.postalCode == null || input.type == null || input.deviceId == null || input.brandName == null
            || input.tagline == null) {
            res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        }
        let user = {
            'email': input.email,
            'password': md5(input.password),
            'firstName': input.firstName,
            'lastName': input.lastName,
            'address': input.address,
            'city': input.city,
            'province': input.province,
            'postalCode': input.postalCode,
            'avatarURL': input.avatarURL ? input.avatarURL : null,
            'type': input.type
        }

        var values = Object.values(user);
        db_operations.user.registerUser("user", values, function (err, response) {
            if (err) {
                res.json(utils.sendResponse(false, 500, "User already exist! Please use another email."));
            } else if (!err) {
                let registeredUser = db_operations.user.getUser("user", user.email, function (err, registeredUser) {
                    if (err) {
                        res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                    }
                    let fashionDesigner = {
                        'userId': registeredUser[0]['id'],
                        'brandName': input.brandName,
                        'tagline': input.tagline
                    }
                    var designer = Object.values(fashionDesigner);
                    db_operations.fashionDesigner.addDesigner("designer", designer, function (err, response) {
                        if (err) {
                            res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                        }
                    });
                    var token = generateToken();
                    var date = new Date();
                    let userSession = {
                        'sessionToken': token,
                        'userId': registeredUser[0]['id'],
                        'lastLoginTime': date.toISOString().slice(0, 19).replace('T', ' '),
                        'deviceId': input.deviceId
                    }
                    db_operations.user.createSession("login", Object.values(userSession), function (err, response) {
                        if (err) {
                            res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                        }
                    });
                    designer = {
                        'id': registeredUser[0].id,
                        'email': registeredUser[0].email,
                        'firstName': registeredUser[0].firstName,
                        'lastName': registeredUser[0].lastName,
                        'address': registeredUser[0].address,
                        'city': registeredUser[0].city,
                        'province': registeredUser[0].province,
                        'postalCode': registeredUser[0].postalCode,
                        'avatarURL': registeredUser[0].avatarURL ? registeredUser[0].avatarURL : null,
                        'type': registeredUser[0].type
                    }
                    let output = {
                        'designer': designer,
                        'sessionToken': {
                            'token': token
                        }
                    }

                    output['designer']['brandName'] = input.brandName;
                    output['designer']['tagline'] = input.tagline;

                    res.json(utils.sendResponse(true, 200, "Fashion Designer registered successfully!", output));
                })
            }
        });
    },
    updateFashionDesigner: function(req,res) {
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
                if (input.id == null || input.password == null || input.firstName == null ||
                    input.lastName == null || input.address == null || input.city == null || input.province == null
                    || input.postalCode == null || input.brandName == null || input.tagline == null) {
                    res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
                    return;
                }
                let user = {
                    'password': md5(input.password),
                    'firstName': input.firstName,
                    'lastName': input.lastName,
                    'address': input.address,
                    'city': input.city,
                    'province': input.province,
                    'postalCode': input.postalCode,
                    'avatarURL': input.avatarURL ? input.avatarURL : null
                }
                let designer = {
                    'brandName': input.brandName,
                    'tagline' : input.tagline
                }
                var user_id = input.id;
                db_operations.user.updateUser("user", user, user_id, function (err, response) {
                    if (err) {
                        res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                    } else {
                        db_operations.fashionDesigner.updateFashionDesigner("designer", designer, user_id, function (err, response) {
                            if (err) {
                                res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                            }
                            res.json(utils.sendResponse(true, 200, "Designer profile is updated successfully!"));
                        })
                        //res.json(utils.sendResponse(true, 200, "User updated successfully!"));
                    }
                })
            } else {
                res.json(utils.sendResponse(false, 500, "User is not authorized!!!"));
            } 
        })
    }
}

function generateToken() {
    return crypto.randomBytes(25).toString('hex');
}
