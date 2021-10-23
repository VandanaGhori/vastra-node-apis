const { response } = require("express");
let db = require("./db_config");

module.exports.product = {
    getAllData(table_name, callback) {
        var q = "Select * from " + table_name + " Where isDeleted = 0";
        db.query(q, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    }
}

module.exports.validate = {
    validateToken(token, callback) {
        var q = "Select count(sessionToken) as sessionToken from login where sessionToken = '" + token + "'";
        db.query(q, function (err, res) {
            if (err) {
                return callback(err,null);
            }
            callback(null,res);
        })
    },
    getUserIdFromToken(token, callback) {
        var q = "Select userId from login where sessionToken = '" + token + "'";
        db.query(q, function (err, res) {
            if (err) {
                return callback(err, null);
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
    updateUser(table_name, values, user_id, callback) {
        var q = "Update " + table_name + " set password = ?, firstName = ?, lastName = ?, address = ?, city = ?, province = ?, " + 
        "postalCode = ?, avatarURL = ? where id = " + user_id;
        //console.log("Update Query = " + q);
        db.query(q, [values.password,values.firstName,values.lastName,values.address,values.city,values.province,values.postalCode,values.avatarURL], function (err, res) {
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
    getShopperById(user_id, callback) {
        var q = "Select id,email,firstName,lastName,address,city,province,"+
        "postalCode,avatarURL,type from user where id = " + user_id;
        db.query(q, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    checkLoginCredentials(table_name, login_param, callback) {
        var q = "Select id,type from " + table_name + " Where email = '" + login_param.email +
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
    }
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
    updateFashionDesigner(table_name, values, user_id, callback) {
        var q = "Update " + table_name + " set brandName = ?, tagline = ? where userId = " + user_id;
        db.query(q, [values.brandName,values.tagline], function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    getFashionDesignerById(user_id, callback) {
        var q = "SELECT U.id, U.email, U.firstName, U.lastName, U.address, U.city, U.province, " +
        "U.postalCode, U.avatarURL, U.type, D.brandName, D.tagline FROM user as U, designer as D where U.id = D.userId" + 
        " and D.userId=" + user_id;
        db.query(q, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    }
}

module.exports.catalogue = {
    addCatalogue(table_name, values, callback) {
        var q = "Insert into " + table_name + " (name,designerId) Values (?)";
        db.query(q, [values], function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
}
