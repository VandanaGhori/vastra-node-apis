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
            sendResponse({ success: false, code: 404, message: "Parameter(s) are missing" });
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
                res.json(sendResponse(false, 500, "Opps something went wrong!"));
            } else if (!err) {
                let registeredUser = db_operations.user.getUser("user", user.email, function (err, registeredUser) {
                    //console.log("User Response " + registeredUser[0]['id']);
                    if (err) {
                        res.json(sendResponse(false, 500, "Opps something went wrong!"));
                    }
                    var token = generateToken();
                    var date = new Date();
                    let userSession = {
                        'sessionToken': token,
                        'userId': registeredUser[0]['id'],
                        'lastLoginTime': date.toISOString().slice(0,19).replace('T',' '),
                        'deviceId': input.deviceId
                    }
                    db_operations.user.createSession("login", Object.values(userSession), function (err, response) {
                        if (err) {
                            res.json(sendResponse(false, 500, "Opps something went wrong!"));
                        }
                    });
                    let output = {
                        'user': registeredUser,
                        'sessionToken': {
                            'token': token
                        }
                    }
                    res.json(sendResponse(true, 200, "User registered successfully!", output));
                })
            }
        });
    }
}

function generateToken() {
    return crypto.randomBytes(25).toString('hex');
}

function sendResponse(success, code, message, data = null) {
    return { 'success': success, "code": code, "message": message, "data": data};
}