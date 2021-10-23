const { json } = require("express");
const db_operations = require("../db_operations");
var md5 = require('md5');
var crypto = require('crypto');
var utils = require('../utils');

module.exports = {
    addNewUser: function (req, res) {
        input = req.body;
        if (input.email == null || input.password == null || input.firstName == null ||
            input.lastName == null || input.address == null || input.city == null || input.province == null
            || input.postalCode == null || input.type == null || input.deviceId == null) {
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

        var values = Object.values(user)
        db_operations.user.registerUser("user", values, function (err, response) {
            if (err) {
                res.json(utils.sendResponse(false, 500, "User already exist! Please use another email."));
            } else if (!err) {
                let registeredUser = db_operations.user.getUser("user", user.email, function (err, registeredUser) {
                    if (err) {
                        res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                    }
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
                    let user = {
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
                        'user': user,
                        'sessionToken': {
                            'token': token
                        }
                    }
                    res.json(utils.sendResponse(true, 200, "User registered successfully!", output));
                })
            }
        });
    },
    login: function (req, res) {
        input = req.body;
        if (input.email == null || input.password == null || input.deviceId == null) {
            res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        }
        let loginCredentials = {
            'email': input.email,
            'password': md5(input.password)
        }
        db_operations.user.checkLoginCredentials("user", loginCredentials, function (err, response) {
            if (err) {
                res.json(utils.sendResponse(false, 500, "User does not exist!!!"));
            } else if (!err) {
                if (response.length != 0) {
                    let user_id = response[0]['id'];
                    let user_type = response[0]['type'];
                    updateUserSession(user_id, input.deviceId, function (output) {
                        if (user_type == 1) {
                            db_operations.user.getShopperById(user_id, function (err, shopper) {
                                if (err) {
                                    res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                                }
                                output['shopper'] = shopper[0];
                                res.json(utils.sendResponse(true, 200, "Shopper Logged in successfully!", output));
                            })
                        } else {
                            db_operations.fashionDesigner.getFashionDesignerById(user_id, function (err, fashionDesigner) {
                                if (err) {
                                    res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                                }
                                if(fashionDesigner != null) {
                                    output['fashionDesigner'] = fashionDesigner[0];
                                    res.json(utils.sendResponse(true, 200, "Fashion Designer Logged in successfully!", output));
                                }
                            })
                        }
                    });
                } else {
                    res.json(utils.sendResponse(false, 500, "Invalid Credentials Provided!!!", response));
                }
            }
        })
    },
    updateShopper: function(req,res) {
        input = req.body;
        token = req.headers['token'];
        if(token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!!!"))
        }

        db_operations.validate.validateToken(token, input.id, function (err, response){
            if (err) {
                res.json(utils.sendResponse(false, 500, "Opps something went wrong!"))
            } 
            if (response[0]['sessionToken'] == 1) {
                if (input.id == null || input.password == null || input.firstName == null ||
                    input.lastName == null || input.address == null || input.city == null || input.province == null
                    || input.postalCode == null) {
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
                var user_id = input.id;
                db_operations.user.updateUser("user", user, user_id, function (err, response) {
                    if (err) {
                        res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
                    } else {
                        res.json(utils.sendResponse(true, 200, "User Profile is updated successfully!"));
                    }
                })
            } else {
                res.json(utils.sendResponse(false, 500, "User is not authorized!!!"));
            } 
        })
    }
}

function updateUserSession(userId, deviceId, callback) {
    let output = db_operations.user.checkSession("login", userId, function (err, response) {
        if (err) {
            res.json(utils.sendResponse(false, 500, "Opps something went wrong!"))
        }
        if (response[0]['userId'] == 1) {
            db_operations.user.deleteSession("login", userId, function (err, response) {
                if (err) {
                    res.json(utils.sendResponse(false, 500, "Opps something went wrong!"))
                }
            })
        }

        var token = generateToken();
        var date = new Date();
        let userNewSession = {
            'sessionToken': token,
            'userId': userId,
            'lastLoginTime': date.toISOString().slice(0, 19).replace('T', ' '),
            'deviceId': deviceId
        }
        db_operations.user.createSession("login", Object.values(userNewSession), function (err, response) {
            if (err) {
                res.json(utils.sendResponse(false, 500, "Opps something went wrong!"));
            }
        });
        output = {
            'sessionToken': {
                'token': token
            }
        }
        callback(output);
    })
}

function generateToken() {
    return crypto.randomBytes(25).toString('hex');
}
