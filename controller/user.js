const { json } = require("express");
const db_operations = require("../db_operations");
var md5 = require('md5');

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
                return res.json(sendResponse(false, 500, "Opps something went wrong gdfgdfgdfg!"));
            } else if (!err) {
                console.log("Email" + user.email);
                let registeredUser = db_operations.user.getUser("user", user.email, function (err, registeredUser) {
                    console.log("User Response " + registeredUser[0]['id']);
                    if (err) {
                        console.log("1111111111111")
                        res.json(sendResponse(false, 500, "Opps something went wrong!"));
                    }
                    token = generateToken(registeredUser[0]['id']);
                    let userSession = {
                        'sessionToken': token,
                        'userId': user_id,
                        'lastLoginTime': Date(),
                        'deviceId': input.deviceId
                    }
                    db_operations.user.createSession("login", Object.values(userSession), function (err, response) {
                        if (err) {
                            console.log("2222222222222")
                            res.json(sendResponse(false, 500, "Opps something went wrong!"));
                        }
                    });
                    let output = {
                        'user': response,
                        'sessionToken': {
                            'token': token
                        }
                    }
                    console.log("end!!")
                    res.json(sendResponse(false, 500, "Opps something went wrong!", output));
                })
            }
        });
    }
}

function generateToken(user_id) {
    require('crypto').randomBytes(25, function (err, buffer) {
        return buffer.toString('hex');
    });
}

function sendResponse(success, code, message, data = null) {
    return { 'success': success, "code": code, "message": message, "data": data};
}