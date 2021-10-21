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
            if(err) {
                return callback(err,null);
            } 
            callback(null,res);
        })
    },
    createSession(table_name, values, callback) {
        var q = "Insert into " + table_name + " (sessionToken, userId, lastLoginTime, deviceId) Values (?)";
        db.query(q, [values], function(err,res) {
            if(err) {
                return callback(err,null);
            } 
            callback(null,res);
        })
    },
    getUser(table_name, email, callback) {
        var q = "Select * from " + table_name + " where email = '" + email + "'";
        db.query(q,email,function(err,res) {
            if(err) {
                return callback(err, null);
            }
            callback(null,res);
        })
    }
}

function postAllData(values) {

}

function putAllData() {

}

function deleteAllData() {

}
