const { json } = require("express");
const db_operations = require("../db_operations");
var md5 = require('md5');
var crypto = require('crypto');
var utils = require('../utils');

module.exports = {
    addNewUser: async function (req, res) {
        input = req.body;
        if (input.email == null || input.password == null || input.firstName == null ||
            input.lastName == null || input.address == null || input.city == null || input.province == null
            || input.postalCode == null || input.type == null || input.deviceId == null) {
            res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        }

        let userExist = await db_operations.user.getUser("user", input.email)
        if (userExist) {
            res.json(utils.sendResponse(false, 500, "You are already registered. Please Login."));
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
        let result = await db_operations.user.registerUser("user", values);

        if (result != false) {
            let registeredUser = await db_operations.user.getUser("user", user.email)
            if (registeredUser != false) {
                var token = generateToken();
                var date = new Date();
                let userSession = {
                    'sessionToken': token,
                    'userId': registeredUser['id'],
                    'lastLoginTime': date.toISOString().slice(0, 19).replace('T', ' '),
                    'deviceId': input.deviceId
                }
                if (await db_operations.user.createSession("login", Object.values(userSession))) {
                    let user = {
                        'userId': registeredUser.id,
                        'email': registeredUser.email,
                        'firstName': registeredUser.firstName,
                        'lastName': registeredUser.lastName,
                        'address': registeredUser.address,
                        'city': registeredUser.city,
                        'province': registeredUser.province,
                        'postalCode': registeredUser.postalCode,
                        'avatarURL': registeredUser.avatarURL ? registeredUser.avatarURL : null,
                        'type': registeredUser.type
                    }
                    let output = {
                        'user': user,
                        'sessionToken': token
                    }
                    //console.log(output)
                    res.json(utils.sendResponse(true, 200, "User registered successfully!", output));
                    return;
                }
            }

        }
        return res.json(utils.sendResponse(false, 500, "Opps!!", []));
    },
    login: async function (req, res) {
        input = req.body;
        if (input.email == null || input.password == null || input.deviceId == null) {
            res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        }

        let loginCredentials = {
            'email': input.email,
            'password': md5(input.password)
        }

        let loginResponse = await db_operations.user.checkLoginCredentials("user", loginCredentials);

        if (loginResponse != false) {
            let user_id = loginResponse['id'];
            let user_type = loginResponse['type'];
            let sessionResult = await updateUserSession(user_id, input.deviceId);
            if (sessionResult != false) {
                let token = sessionResult;
                if (user_type == 1) {
                    let shopperResponse = await db_operations.user.getShopperById(user_id);
                    if (shopperResponse != false) {
                        let user = {
                            'userId': shopperResponse.id,
                            'email': shopperResponse.email,
                            'firstName': shopperResponse.firstName,
                            'lastName': shopperResponse.lastName,
                            'address': shopperResponse.address,
                            'city': shopperResponse.city,
                            'province': shopperResponse.province,
                            'postalCode': shopperResponse.postalCode,
                            'avatarURL': shopperResponse.avatarURL ? shopperResponse.avatarURL : null,
                            'type': shopperResponse.type
                        }
                        let output = {
                            'user': user,
                            'sessionToken': token
                        }
                        return res.json(utils.sendResponse(true, 200, "User loggedIn successfully!", output));
                    }
                } else {
                    let designerResponse = await db_operations.fashionDesigner.getFashionDesignerById(user_id);
                    if (designerResponse != false) {
                        let designer = {
                            'userId': designerResponse.userId,
                            'email': designerResponse.email,
                            'firstName': designerResponse.firstName,
                            'lastName': designerResponse.lastName,
                            'address': designerResponse.address,
                            'city': designerResponse.city,
                            'province': designerResponse.province,
                            'postalCode': designerResponse.postalCode,
                            'avatarURL': designerResponse.avatarURL ? designerResponse.avatarURL : null,
                            'type': designerResponse.type,
                            'id': designerResponse.designerId,
                            'brandName': designerResponse.brandName,
                            'tagline': designerResponse.tagline
                        }
                        let output = {
                            'designer': designer,
                            'sessionToken': token
                        }
                        return res.json(utils.sendResponse(true, 200, "Designer loggedIn successfully!", output));
                    }
                }
            }
        }
        return res.json(utils.sendResponse(false, 403, "Your session is expired!", []));
    },
    updateShopper: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {
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
            let updateUserResponse = await db_operations.user.updateUser("user", user, user_id);
            if (updateUserResponse != false) {
                return res.json(utils.sendResponse(true, 200, "User Profile is updated successfully!"));
            } else {
                return res.json(utils.sendResponse(false, 500, "Opps something went wrong!", []));
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }
    }
}

async function updateUserSession(userId, deviceId) {
    if (await db_operations.user.deleteSession("login", userId)) {
        var token = generateToken();
        var date = new Date();
        let userNewSession = {
            'sessionToken': token,
            'userId': userId,
            'lastLoginTime': date.toISOString().slice(0, 19).replace('T', ' '),
            'deviceId': deviceId
        }
        let output = await db_operations.user.createSession("login", Object.values(userNewSession));
        if (output == false) {
            return false;
        }
        return token;
    }
    return false;
}

function generateToken() {
    return crypto.randomBytes(25).toString('hex');
}
