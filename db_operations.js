const { response } = require("express");
const util = require('util');
let db = require("./db_config");

const query = util.promisify(db.query).bind(db);

module.exports.product = {
    async getAllProducts(table_name) {
        try {
            var q = "Select * from " + table_name + " Where isDeleted = 0";
            const data = await query(q);
            return data;
        } catch (err) {
            return false;
        }
    }
}

module.exports.productType = {
    async getAllProductTypes(table_name) {
        try {
            var q = "SELECT * FROM " + table_name;
            const data = await query(q);
            return data;
        } catch (err) {
            //console.log(err)
            return false;
        }
    },
    async getDesignerProductsByTypes() {
        try {
            var q = ""
        } catch (err) {

        }
    }
}

module.exports.productSize = {
    async getAllProductSizes(table_name, designerId, productTypeId) {
        try {
            var q = "SELECT brandSize FROM " + table_name + " where productId in " +
                "(select productId from product where catalogueId in (SELECT catalogueId FROM catalogue" +
                " where designerId = " + designerId + " ) and typeId = " + productTypeId + " )";
            const data = await query(q);
            return data;
        } catch (err) {
            return false;
        }
    }
}

module.exports.validate = {
    async validateToken(token) {
        try {
            //var q = "Select count(sessionToken) as sessionToken from login where sessionToken = '" + token + "'";
            var q = "Select * from login where sessionToken = '" + token + "'";
            const data = await query(q);
            return data[0];
        } catch (err) {
            return false;
        }
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
    async registerUser(table_name, values) {
        try {
            var q = "Insert into " + table_name + " (email,password,firstName," +
                "lastName,address,city,province,postalCode,avatarURL,type) Values (?)";
            const rows = await query(q, [values]);
            return rows
        } catch (err) {
            return false;
        }
    },
    async updateUser(table_name, values, user_id) {
        try {
            var q = "Update " + table_name + " set password = ?, firstName = ?, lastName = ?, address = ?, city = ?, province = ?, " +
                "postalCode = ?, avatarURL = ? where id = " + user_id;
            const rows = await query(q, [values.password, values.firstName, values.lastName, values.address, values.city, values.province, values.postalCode, values.avatarURL]);
            return rows
        } catch (err) {
            return false
        }
    },
    async createSession(table_name, values) {
        try {
            var q = "Insert into " + table_name + " (sessionToken, userId, lastLoginTime, deviceId) Values (?)";
            const rows = await query(q, [values]);
            return rows
        } catch (err) {
            return false;
        }
    },
    async getUser(table_name, email) {
        try {
            var q = "Select * from " + table_name + " where email = '" + email + "'";
            const data = await query(q);
            if(data.length > 0) {
                return data[0];
            }
            //return data[0]
        } catch (err) {
            //return false;
        }
        return false;
    },
    async getShopperById(user_id) {
        try {
            var q = "Select id,email,firstName,lastName,address,city,province," +
                "postalCode,avatarURL,type from user where id = " + user_id;
            const data = await query(q);
            if(data.length > 0) {
                return data[0];
            }
            //return data[0];
        } catch (err) {
            //return false;
        }
        return false;
    },
    async checkLoginCredentials(table_name, login_param) {
        try {
            var q = "Select id,type from " + table_name + " Where email = '" + login_param.email +
                "' and password = '" + login_param.password + "'";
            //console.log("Query " + q);
            const data = await query(q);
            //console.log("data " + JSON.stringify(data[0]));
            if (data.length > 0) {
                return data[0]
            }
        } catch (err) {
        }
        return false;
    },
    async checkSession(table_name, user_id) {
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
           // console.log("Delete record " + rows)
            return rows
        } catch (err) {
            return false;
        }
    }
}

module.exports.fashionDesigner = {
    async addDesigner(table_name, values) {
        try {
            var q = "Insert into " + table_name + " (userId,brandName,tagline) Values (?)";
            const rows = await query(q, [values]);
            return rows;
        } catch (err) {
            return false;
        }
    },
    async updateFashionDesigner(table_name, values, user_id) {
        try {
            var q = "Update " + table_name + " set brandName = ?, tagline = ? where userId = " + user_id;
            const rows = await query(q, [values.brandName, values.tagline]);
            return rows;
        } catch (err) {
            return false;
        }
    },
    async getFashionDesignerById(user_id) {
        try {
            var q = "SELECT U.id as userId, U.email, U.firstName, U.lastName, U.address, U.city, U.province, " +
                "U.postalCode, U.avatarURL, U.type, D.id as designerId, D.brandName, D.tagline FROM user as U, designer as D where U.id = D.userId" +
                " and D.userId=" + user_id;
            const data = await query(q);
            if (data.length > 0) {
                return data[0]
            }
            //return data[0];
        } catch (err) {
            //return false;
        }
        return false;
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
            if (data.length > 0) {
                return data[0]
            }
            //return data[0]
        } catch (err) {
            //return false;
        }
        return false;
    },
}

module.exports.catalogue = {
    async addCatalogue(table_name, values) {
        try {
            var q = "Insert into " + table_name + " (name,designerId) Values (?)";
            const rows = await query(q, [values]);
            return rows;
        } catch (err) {
            return false;
        }
    },
    async getCatalogueById(table_name, catalogue_id) {
        try {
            var q = "SELECT * FROM " + table_name + " where id = " + catalogue_id;
            const data = await query(q);
            return data[0];
        } catch (err) {
            return false;
        }
    },
    async isCatalogueExist(table_name, catalogueName, designerId) {
        try {
            var q = "SELECT * FROM " + table_name + " where name = '" + catalogueName + "' and designerId = " + designerId;
            const data = await query(q);
            //console.log(data);
            return data;
        } catch (err) {
            return [];
        }
    },
    async getAllCatalogue(table_name, designerId) {
        try {
            var q = "SELECT * FROM " + table_name + " where designerId = " + designerId;
            const data = await query(q);
            //console.log("Data " + data.length);
            return data;
        } catch (err) {
            return false;
        }
    }
}

module.exports.color = {
    async getAllColors(table_name) {
        try {
            var q = "SELECT * FROM " + table_name;
            const data = await query(q);
            return data;
        } catch (err) {
            return false;
        }
    },
    async addProductColor(table_name, values) {
        try {
            var q = "Insert into " + table_name + " values (productId, prominentColorId, secondaryColorId, thirdColorId) (?)";
            const row = await query(q, [values]);
            return row;
        } catch (err) {
            return false;
        }
    },
    async updateProductColor(table_name, values, productColorId) {
        try {
            var q = "Update " + table_name + " set prominentColorId = ?, secondaryColorId = ? thirdColorId = ? where productColorId = " + productColorId;
            const row = await query(q, [values.prominentColorId, values.secondaryColorId, values.thirdColorId]);
            return row;
        } catch (err) {
            return false;
        }
    }, 
    async deleteProductColor(table_name, productColorId) {
        try {
            var q = "Delete from " + table_name + " where productColorId = " + productColorId;
            const row = await query(q);
            return row;
        } catch (err) {
            return false;
        }
    }
}

module.exports.material = {
    async getAllMaterials(table_name) {
        try {
            var q = "SELECT * FROM " + table_name;
            const data = await query(q);
            return data;
        } catch (err) {
            return false;
        }
    },
    async isMaterialExist(table_name, materialName) {
        try {
           // var q = "SELECT count(*) as noOfMaterialExist FROM " + table_name + " where material = '" + materialName + "'";
            var q = "SELECT * FROM " + table_name + " where material = '" + materialName + "'";
            const data = await query(q);
            return data[0];
        } catch (err) {
            return false;
        }
    },
    async addMaterial(table_name, materialName) {
        try {
            var q = "Insert into " + table_name + " (material) Values ('" + materialName + "')";
            //console.log("Insert Query " + q);
            const rows = await query(q);
            return rows;
        } catch (err) {
            return false;
        }
    },
    async getMaterialById(table_name, material_id) {
        try {
            var q = "SELECT * FROM " + table_name + " where id = " + material_id;
            const data = await query(q);
            return data[0];
        } catch (err) {
            return false;
        }
    }
}
