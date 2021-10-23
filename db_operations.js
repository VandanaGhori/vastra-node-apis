const { response } = require("express");
let db = require("./db_config");

module.exports.product = {
    getAllData(table_name, callback) {
        var q = "Select * from " + table_name + " Where isDeleted = 0";
        db.query(q, function (err, res) {
            if (err) {
                callback(err, null);
            }
            callback(null, res);
        })
    }
}

module.exports.user = {
    registerUser(table_name, values, callback) {
        var q = "Insert into " + table_name + " (email,password,firstName," +
            "lastName,address,city,province,postalCode,avatarURL,type) Values (?)";
        db.query(q, [values], function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    createSession(table_name, values, callback) {
        var q = "Insert into " + table_name + " (sessionToken, userId, lastLoginTime, deviceId) Values (?)";
        db.query(q, [values], function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    getUser(table_name, email, callback) {
        var q = "Select * from " + table_name + " where email = '" + email + "'";
        db.query(q, email, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    checkLoginCredentials(table_name, login_param, callback) {
        var q = "Select id from " + table_name + " Where email = '" + login_param.email +
            "' and password = '" + login_param.password + "'";
        db.query(q, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    checkSession(table_name, user_id, callback) {
        var q = "Select count(userId) as userId from " + table_name + " where userId = " + user_id;
        db.query(q,function(err,res) {
            if (err) {
                return callback(err,null);
            } 
            callback(null,res);
        })
    },
    deleteSession(table_name, user_id, callback) {
        var q = "Delete from " + table_name + " Where userId = " + user_id;
        db.query(q,function(err,res) {
            if (err) {
                return callback(err,null);
            }
            callback(null,res);
        })
    },
    updateSession(table_name, user_id, device_id, callback) {
        var q = "Select count(userId) from " + table_name + " where userId = " + user_id;
        if (q) {
            "Delete from"
        } else {
            var token = generateToken();
            var date = new Date();
            let userSession = {
                'sessionToken': token,
                'userId': registeredUser[0]['id'],
                'lastLoginTime': date.toISOString().slice(0, 19).replace('T', ' '),
                'deviceId': input.deviceId
            }
            this.createSession(table_name, Object.values(userSession), function (err, response) {
                if (err) {
                    res.json(sendResponse(false, 500, "Opps something went wrong!"));
                }
            })
        }
    },
}

module.exports.fashionDesigner = {
    addDesigner(table_name, values, callback) {
        var q = "Insert into " + table_name + " (userId,brandName,tagline) Values (?)";
        db.query(q, [values], function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
}

function postAllData(values) {

}

function putAllData() {

}

function deleteAllData() {

}
