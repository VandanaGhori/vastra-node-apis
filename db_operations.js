const { response } = require("express");
const util = require('util');
let db = require("./db_config");

const query = util.promisify(db.query).bind(db);

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
                return callback(err, null);
            }
            callback(null, res);
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
            return callback(null, res);
        })
    },
    async registerUserV2(table_name, values) {
        try {
            var q = "Insert into " + table_name + " (email,password,firstName," +
                "lastName,address,city,province,postalCode,avatarURL,type) Values (?)";
            const rows = await query(q, [values]);
            return rows
        } catch (err) {
            return false;
        }
    },
    updateUser(table_name, values, user_id, callback) {
        var q = "Update " + table_name + " set password = ?, firstName = ?, lastName = ?, address = ?, city = ?, province = ?, " +
            "postalCode = ?, avatarURL = ? where id = " + user_id;
        db.query(q, [values.password, values.firstName, values.lastName, values.address, values.city, values.province, values.postalCode, values.avatarURL], function (err, res) {
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
            return callback(null, res);
        })
    },
    async createSessionV2(table_name, values) {
        try {
            var q = "Insert into " + table_name + " (sessionToken, userId, lastLoginTime, deviceId) Values (?)";
            const rows = await query(q, [values]);
            return rows
        } catch (err) {
            return false;
        }
     },
    getUser(table_name, email, callback) {
        var q = "Select * from " + table_name + " where email = '" + email + "'";
        db.query(q, email, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, res);
        })
    },
    async getUserV2(table_name, email) {
        try {
            var q = "Select * from " + table_name + " where email = '" + email + "'";
            const data = await query(q);
            return data[0]
        } catch (err) {
            return false;
        }
    },
    async getShopperById(user_id) {
        try {
            var q = "Select id,email,firstName,lastName,address,city,province," +
            "postalCode,avatarURL,type from user where id = " + user_id;
            const data = await query(q);
            return data[0];
        } catch(err) {
            return err;
        }
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
    async checkLoginCredentialsV2(table_name, login_param) {
        try {
            var q = "Select id,type from " + table_name + " Where email = '" + login_param.email +
            "' and password = '" + login_param.password + "'";
            //console.log("Query " + q);
            const data = await query(q);
            return data[0]
        } catch (err) {
            return false;
        }
    },
    checkSession(table_name, user_id, callback) {
        var q = "Select count(userId) as userId from " + table_name + " where userId = " + user_id;
        db.query(q, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    async checkSession2(table_name, user_id) {
        try {
            var q = "Select count(userId) as userId from " + table_name + " where userId = " + user_id;
            const data = await query(q);
            return data[0]
        } catch (err) {
            return false;
        }
    },
    async deleteSession(table_name, user_id) {
        try {
            var q = "Delete from " + table_name + " Where userId = " + user_id;
            const rows = await query(q);
            console.log("Delete record " + rows)
            return rows
        } catch (err) {
            return false;
        }
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
    async addDesignerV2(table_name, values) {
        try{
            var q = "Insert into " + table_name + " (userId,brandName,tagline) Values (?)";
            const rows = await query(q, [values]);
            return rows;
        } catch(err) {
            return false;
        }
    },
    updateFashionDesigner(table_name, values, user_id, callback) {
        var q = "Update " + table_name + " set brandName = ?, tagline = ? where userId = " + user_id;
        db.query(q, [values.brandName, values.tagline], function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    async getFashionDesignerById(user_id) {
        try {
            var q = "SELECT U.id as userId, U.email, U.firstName, U.lastName, U.address, U.city, U.province, " +
            "U.postalCode, U.avatarURL, U.type, D.id as designerId, D.brandName, D.tagline FROM user as U, designer as D where U.id = D.userId" +
            " and D.userId=" + user_id;
            const data = await query(q);
            return data[0];
        } catch(err) {
            return err;
        }
    },
    getDesignerIdFromUserId(user_id, callback) {
        var q = "SELECT id from designer where userId=" + user_id;
        db.query(q, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    async getDesigner(table_name, user_id) {
        try {
            var q = "Select * from " + table_name + " where userId = " + user_id;
            const data = await query(q);
            return data[0]
        } catch (err) {
            return false;
        }
    },
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
    getCatalogueById(table_name, catalogue_id, callback) {
        var q = "SELECT * FROM " + table_name + " where id = " + catalogue_id;
        db.query(q, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    },
    getAllCatalogue(table_name, callback) {
        var q = "SELECT * FROM " + table_name;
        db.query(q, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            callback(null, res);
        })
    }
}
