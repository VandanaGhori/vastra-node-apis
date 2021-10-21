const db_operations = require("../db_operations");
const md5 = require('md5');

module.exports = {
    addNewFashionDesigner : function(req,res) {
        input = req.body;
        if (input.email == null || input.password == null || input.firstName == null ||
            input.lastName == null || input.address == null || input.city == null || input.province == null
            || input.postalCode == null || input.type == null || input.deviceId == null || input.brandName == null
            || input.tagline == null) {
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

        var values = Object.values(user);

        db_operations.user.registerUser("user", values, function(err,response){
            if(err) {
                return res.json(sendResponse(false,500,"Opps something went wrong!"));
            } 
            console.log("Success: " + values);
        })

        let fashionDesigner = {
            //'userId' : userId,  // Fetch from email id
            'brandName' : input.brandName,
            'tagline' : input.tagline
        }
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