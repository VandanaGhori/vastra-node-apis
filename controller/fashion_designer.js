const { json } = require("express");
const db_operations = require("../db_operations");
const md5 = require('md5');
var crypto = require('crypto');
var utils = require('../utils');

module.exports = {
    addNewFashionDesigner: async function (req, res) {
        input = req.body;
        if (input.email == null || input.password == null || input.firstName == null ||
            input.lastName == null || input.address == null || input.city == null || input.province == null
            || input.postalCode == null || input.type == null || input.deviceId == null || input.brandName == null
            || input.tagline == null) {
            res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        }

        let userExist = await db_operations.user.getUser("user", input.email)
        console.log("ISUSerExist!!!!!!!!!!!!" + userExist);
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

        var values = Object.values(user);
        let result = await db_operations.user.registerUser("user", values);

        if (result != false) {
            let registeredUser = await db_operations.user.getUser("user", user.email)
            if (registeredUser != false) {

                let fashionDesigner = {
                    'userId': registeredUser['id'],
                    'brandName': input.brandName,
                    'tagline': input.tagline
                }
                var designer = Object.values(fashionDesigner);
                let designerResult = await db_operations.fashionDesigner.addDesigner("designer", designer)

                if (designerResult != false) {
                    let registeredDesigner = await db_operations.fashionDesigner.getDesigner("designer", registeredUser['id']);
                    if (registeredDesigner != false) {
                        var token = generateToken();
                        var date = new Date();
                        let userSession = {
                            'sessionToken': token,
                            'userId': registeredUser['id'],
                            'lastLoginTime': date.toISOString().slice(0, 19).replace('T', ' '),
                            'deviceId': input.deviceId
                        }
                        if (await db_operations.user.createSession("login", Object.values(userSession))) {
                            let designer = {
                                'userId': registeredUser.id,
                                'email': registeredUser.email,
                                'firstName': registeredUser.firstName,
                                'lastName': registeredUser.lastName,
                                'address': registeredUser.address,
                                'city': registeredUser.city,
                                'province': registeredUser.province,
                                'postalCode': registeredUser.postalCode,
                                'avatarURL': registeredUser.avatarURL ? registeredUser.avatarURL : null,
                                'type': registeredUser.type,
                                'id': registeredDesigner.id,
                                'brandName': registeredDesigner.brandName,
                                'tagline': registeredDesigner.tagline
                            }
                            let output = {
                                'designer': designer,
                                'sessionToken': token
                            }
                            console.log(output)
                            res.json(utils.sendResponse(true, 200, "Fashion designer registered successfully!", output));
                            return;
                        }
                    }
                }
            }
        }
        return res.json(utils.sendResponse(false, 500, "Opps!!", []));
    },
    updateFashionDesigner: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization!"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult != false) {
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
                'tagline': input.tagline
            }
            var user_id = input.id;
            let updateUserResponse = await db_operations.user.updateUser("user", user, user_id);
            if (updateUserResponse != false) {
                let updateDesignerResponse = await db_operations.fashionDesigner.updateFashionDesigner("designer", designer, user_id);
                if(updateDesignerResponse != false) {
                    return res.json(utils.sendResponse(true, 200, "Designer's Profile is updated successfully!"));
                } else {
                    return res.json(utils.sendResponse(false, 500, "Opps something went wrong!", []));    
                }
            } else {
                return res.json(utils.sendResponse(false, 500, "Opps something went wrong!", []));
            }
        } else {
            return res.json(utils.sendResponse(false, 403, "User is not authorized!"));
        }
    }
}

function generateToken() {
    return crypto.randomBytes(25).toString('hex');
}
