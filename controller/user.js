const { json } = require("express");
const db_operations = require("../db_operations");
var md5 = require('md5');
var crypto = require('crypto');

module.exports = {
    addNewUser: function (req, res) {
        input = req.body;
        if (input.email == null || input.password == null || input.firstName == null ||
            input.lastName == null || input.address == null || input.city == null || input.province == null
            || input.postalCode == null || input.type == null || input.deviceId == null) {
            res.json(sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        }
        let user = {
            'email': input.email,
            //'password': md5(input.password),
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
                res.json(sendResponse(false, 500, "Opps something went wrong!"));
            } else if (!err) {
                let registeredUser = db_operations.user.getUser("user", user.email, function (err, registeredUser) {
                    if (err) {
                        res.json(sendResponse(false, 500, "Opps something went wrong!"));
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
                            res.json(sendResponse(false, 500, "Opps something went wrong!"));
                        }
                    });
                    let output = {
                        'user': registeredUser[0],
                        'sessionToken': {
                            'token': token
                        }
                    }
                    res.json(sendResponse(true, 200, "User registered successfully!", output));
                })
            }
        });
    },
    login: function (req, res) {
        input = req.body;
        if (input.email == null || input.password == null || input.deviceId == null) {
            res.json(sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        }
        let loginCredentials = {
            'email': input.email,
            'password': md5(input.password)
        }
        db_operations.user.checkLoginCredentials("user", loginCredentials, function (err, response) {
            if (err) {
                res.json(sendResponse(false, 500, "User does not exist!!!"));
            } else if (!err) {
                if (response.length != 0) {
                    let user_id = response[0]['id'];
                    let user_type = response[0]['type'];
                    updateUserSession(user_id, input.deviceId, user_type, function (output) {
                        if (user_type == 1) {
                            db_operations.user.getShopperById(user_id, function (err, shopper) {
                                if (err) {
                                    res.json(sendResponse(false, 500, "Opps something went wrong!"));
                                }
                                output['shopper'] = shopper[0];
                                res.json(sendResponse(true, 200, "Shopper Logged in successfully!", output));
                            })
                        } else {
                            db_operations.fashionDesigner.getFashionDesignerById(user_id, function (err, fashionDesigner) {
                                if (err) {
                                    res.json(sendResponse(false, 500, "Opps something went wrong!"));
                                }
                                if(fashionDesigner != null) {
                                    output['fashionDesigner'] = fashionDesigner[0];
                                    res.json(sendResponse(true, 200, "Fashion Designer Logged in successfully!", output));
                                }
                            })
                        }
                    });
                } else {
                    res.json(sendResponse(false, 500, "Invalid Credentials Provided!!!", response));
                }
            }
        })
    }
}

function generateToken() {
    return crypto.randomBytes(25).toString('hex');
}

function updateUserSession(userId, deviceId, user_type, callback) {
    let output = db_operations.user.checkSession("login", userId, function (err, response) {
        if (err) {
            res.json(sendResponse(false, 500, "Opps something went wrong!"))
        }
        if (response[0]['userId'] == 1) {
            console.log("User found in Login table: " + response[0]['userId']);
            db_operations.user.deleteSession("login", userId, function (err, response) {
                if (err) {
                    res.json(sendResponse(false, 500, "Opps something went wrong!"))
                }
                console.log("Record from login table deleted successully!!!")
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
                res.json(sendResponse(false, 500, "Opps something went wrong!"));
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

function sendResponse(success, code, message, data = null) {
    return { 'success': success, "code": code, "message": message, "data": data };
}