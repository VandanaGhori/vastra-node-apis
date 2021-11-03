const { response } = require("express");
const util = require('util');
const product = require("./controller/product");
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
    },
    async addProduct(values) {
        try {
            var q = "Insert into product (designerId, catalogueId, typeId, title, description, images, price, " +
                "multipackSet, weight, pattern, knitOrWoven, washCare, trend, isDeleted, totalLikes, overallRating, createdAt) Values (?)";
            const resObj = await query(q, [values]);
            return resObj;
        } catch (err) {
            console.log(err);
            return null;
        }
    },
    async getProductById(product_id) {
        try {
            var q = "SELECT * FROM product where id = " + product_id;
            const data = await query(q);
            return data[0];
        } catch (err) {
            return null;
        }
    },
    async deleteProduct(product_id) {
        try {
            var q = "Delete from product where id = " + product_id;
            const rows = await query(q);
            // console.log("Delete record " + rows)
            return rows;
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
    async getDesignerProductsByTypes(designerId, productTypeId) {
        try {
            var q = "SELECT p.id, d.brandName, CONCAT(u.firstName, ' ', u.lastName) as desinerName, " +
                "typeId, title, images, price, totalLikes, overallRating FROM `product` as p, designer as d, " +
                "user as u where d.userId = u.id and typeId = " + productTypeId + " and catalogueId " +
                " in ( SELECT catalogueId from catalogue as c) and d.id = " + designerId;
            const data = await query(q);
            if (data.length > 0) {
                return data;
            }
        } catch (err) {
            return false;
        }
        return [];
    }
}

module.exports.productSize = {
    // async getAllProductSizes(table_name, designerId, productTypeId) {
    //     try {
    //         var q = "SELECT brandSize FROM " + table_name + " where productId in " +
    //             "(select productId from product where catalogueId in (SELECT catalogueId FROM catalogue" +
    //             " where designerId = " + designerId + " ) and typeId = " + productTypeId + " )";
    //         const data = await query(q);
    //         return data;
    //     } catch (err) {
    //         return false;
    //     }
    // }
    async getAllProductSizes(table_name, designerId, productId) {
        try {
            var q = "SELECT ps.* FROM " + table_name + " as ps, product as p WHERE p.id = ps.productId " +
                " and p.id = " + productId + " and p.designerId = " + designerId;
            console.log("Query " + q);
            const data = await query(q);
            if (data.length > 0) {
                return data;
            }
        } catch (err) {
            return false;
        }
        return [];
    }
}

module.exports.validate = {
    async validateToken(token) {
        try {
            //var q = "Select count(sessionToken) as sessionToken from login where sessionToken = '" + token + "'";
            var q = "Select * from login where sessionToken = '" + token + "'";
            const data = await query(q);
            if (data.length > 0) {
                return data[0];
            }
        } catch (err) {
            return false;
        }
        return false;
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
            if (data.length > 0) {
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
            if (data.length > 0) {
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
            var q = "Delete from " + table_name + " where userId = " + user_id;
            const rows = await query(q);
            // console.log("Delete record " + rows)
            return rows;
        } catch (err) {
            return false;
        }
    },
    async deleteSessionToken(table_name, token) {
        try {
            var q = "Delete from " + table_name + " where sessionToken = '" + token + "'";
            const rows = await query(q);
            return rows;
        } catch (err) {
            return false;
        }
    },
    async isEmailExist(table_name, email) {
        try {
            var q = "Select * from " + table_name + " where email = '" + email + "'";
            const data = await query(q);
            if (data.length > 0) {
                return data
            }
        } catch (err) {
        }
        return false;
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
            if (data.length > 0) {
                return data;
            }
        } catch (err) {
            return false;
        }
        return [];
    },
    async addProductColor(table_name, values) {
        // console.log("Values = " + values);
        try {
            var q = "Insert into " + table_name + " (productId, prominentColorId, secondaryColorId, thirdColorId) values (?)";
            const row = await query(q, [values]);
            //console.log("Response " + JSON.stringify(row));
            return row;
        } catch (err) {
            return false;
        }
    },
    async getProductColorById(table_name, id) {
        try {
            var q = "SELECT * FROM " + table_name + " where id = " + id;
            const data = await query(q);
            if (data.length > 0)
                return data[0];
        } catch (err) {
            return false;
        }
        return false;
    },
    async getUpdatedProductColorById(table_name, id, product_id) {
        try {
            var q = "SELECT * FROM " + table_name + " where id = " + id + " and productId = " + product_id;
            const data = await query(q);
            if (data.length > 0) {
                return data[0];
            }
        } catch (err) {
            return false;
        }
        return false;
    },
    async updateProductColor(table_name, values, id, productId) {
        try {
            var q = "Update " + table_name + " set prominentColorId = ?, secondaryColorId = ?, thirdColorId = ? where id = " +
                id + " and productId = " + productId;
            const row = await query(q, [values.prominentColorId, values.secondaryColorId, values.thirdColorId]);
            //console.log("Response " + JSON.stringify(row));
            return row;
        } catch (err) {
            //console.log("Error " + JSON.stringify(err));
            return false;
        }
    },
    async deleteProductColor(table_name, id) {
        try {
            var q = "Delete from " + table_name + " where id = " + id;
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
            const rows = await query(q);
            return rows;
        } catch (err) {
            console.log(err)
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

module.exports.productMaterials = {
    async addProductMaterials(product_id, materialArray) {
        try {
            var q = "Insert into productmaterial (productId, materialId, percentage) values (?)";

            // convert each element of an array to object then insert it into the database
            await materialArray.forEach(element => {
                let material = {
                    'productId': product_id,
                    'materialId': element.materialId,
                    'percentage': element.percentage
                }
                query(q, [Object.values(material)]);
            });

            return true;
        } catch (err) {
            console.log("Error = " + err);
            return false;
        }
    }
}

module.exports.productOccasion = {
    async addProductOccasions(product_id, ocassionArray) {
        try {
            var q = "Insert into productoccasion (productId, occasion) values (?)";

            // convert each element of an array to object then insert it into the database
            await ocassionArray.forEach(element => {
                let occasion = {
                    'productId': product_id,
                    'occasion': element.occasion
                }
                query(q, [Object.values(occasion)]);
            });
            return true;
        } catch (err) {
            console.log("Error = " + err);
            return false;
        }
    }
}

module.exports.productSeasons = {
    async addProductSeasons(product_id, seasonArray) {
        try {
            var q = "Insert into productseason (productId, season) values (?)";

            // convert each element of an array to object then insert it into the database
            await seasonArray.forEach(element => {
                let season = {
                    'productId': product_id,
                    'season': element.season
                }
                query(q, [Object.values(season)]);
            });

            return true;
        } catch (err) {
            console.log("Error = " + err);
            return false;
        }
    }
}

module.exports.productColors = {
    async addProductColors(product_id, colorArray) {
        try {
            var q = "Insert into productcolor (productId, prominentColorId, secondaryColorId, thirdColorId) values (?)";

            // convert each element of an array to object then insert it into the database
            await colorArray.forEach(element => {
                let color = {
                    'productId': product_id,
                    'prominentColorId': element.prominentColorId,
                    'secondaryColorId': element.secondaryColorId == 0 ? null : element.secondaryColorId,
                    'thirdColorId': element.thirdColorId == 0 ? null : element.secondaryColorId
                }
                query(q, [Object.values(color)]);
            });

            return true;
        } catch (err) {
            console.log("Error = " + err);
            return false;
        }
    },
    async getAllProductColors(product_id) {
        try {
            var q = "SELECT * FROM productcolor where productId = " + product_id;
            const data = await query(q);
            if (data.length > 0) {
                await Promise.all(data.map(async (element) => {
                    console.log("-- " + JSON.stringify(element))
                    var q1 = "SELECT * FROM color where id = " + element.prominentColorId;
                    const data1 = await query(q1);
                    let color1 = data1[0];
                    element.prominentColorName = color1.name;
                    element.prominentColorHexCode = color1.hexCode;

                    if (element.secondaryColorId != null) {
                        var q2 = "SELECT * FROM color where id = " + element.secondaryColorId;
                        const data2 = await query(q2);
                        let color2 = data2[0];
                        element.secondaryColorName = color2.name;
                        element.secondaryColorHexCode = color2.hexCode;
                    }

                    if (element.thirdColorId != null) {
                        var q3 = "SELECT * FROM color where id = " + element.thirdColorId;
                        const data3 = await query(q3);
                        let color3 = data3[0];
                        element.thirdColorName = color3.name;
                        element.thirdColorHexCode = color3.hexCode;
                    }
                }))
                return data;
            }
        } catch (err) {
        }
        return [];
    }
}

module.exports.productSizes = {
    async addProductSizes(product_id, sizeArray) {
        try {
            var q = "Insert into productsize (productId, sizeType, brandSize, USSize, " +
                "headCircumferenceMin, headCircumferenceMax, neckMin, neckMax, bustMin, bustMax, " +
                "waistMin, waistMax, hipMin, hipMax, inseamLength, outseamLength, sleeveLength, " +
                "palmCircumferenceMin, palmCircumferenceMax, palmToFingerLength, wristMin, wristMax, footLength, " +
                "frontLength, backLength, width, weightGram, volumeML, customSize) values (?)";

            // convert each element of an array to object then insert it into the database
            await sizeArray.forEach(element => {
                let size = {
                    'productId': product_id,
                    'sizeType': element.sizeType,
                    'brandSize': element.brandSize,
                    'USSize': element.USSize,
                    'headCircumferenceMin': element.headCircumferenceMin,
                    'headCircumferenceMax': element.headCircumferenceMax,
                    'neckMin': element.neckMin,
                    'neckMax': element.neckMax,
                    'bustMin': element.bustMin,
                    'bustMax': element.bustMax,
                    'waistMin': element.waistMin,
                    'waistMax': element.waistMax,
                    'hipMin': element.hipMin,
                    'hipMax': element.hipMax,
                    'inseamLength': element.inseamLength,
                    'outseamLength': element.outseamLength,
                    'sleeveLength': element.sleeveLength,
                    'palmCircumferenceMin': element.palmCircumferenceMin,
                    'palmCircumferenceMax': element.palmCircumferenceMax,
                    'palmToFingerLength': element.palmToFingerLength,
                    'wristMin': element.wristMin,
                    'wristMax': element.wristMax,
                    'footLength': element.footLength,
                    'frontLength': element.frontLength,
                    'backLength': element.backLength,
                    'width': element.width,
                    'weightGram': element.weightGram,
                    'volumeML': element.volumeML,
                    'customSize': element.customSize
                }
                query(q, [Object.values(size)]);
            });

            return true;
        } catch (err) {
            console.log("Error = " + err);
            return false;
        }
    },
    async getAllProductSizes(product_id) {
        try {
            var q = "SELECT * FROM productsize where productId = " + product_id;
            const data = await query(q);
            if (data.length > 0) {
                return data;
            }
        } catch (err) {
        }
        return [];
    }
}

module.exports.productInventory = {
    async addProductInventories(table_name, inventoryValues) {
        try {
            var q = "Insert into " + table_name + " (productId, productSizeId, productColorId, quantityAvailable) values (?)";

            // convert each element of an array to object then insert it into the database
            await inventoryValues.forEach(element => {
                let inventory = {
                    'productId': element.productId,
                    'productSizeId': element.productSizeId,
                    'productColorId': element.productColorId,
                    'quantityAvailable': element.quantityAvailable
                }
                query(q, [Object.values(inventory)]);
            });

            return true;
        } catch (err) {
            console.log("Error = " + err);
            return false;
        }
    },
    async updateProductInventories(table_name, inventoryValues) {
        try {
            var q = "Update " + table_name + " set productSizeId = ?, productColorId = ?, quantityAvailable = ? Where id = ? and productId = ?";

            // Pass individual element as a replacement of ? in query... No need to convert into array of elements
            await inventoryValues.forEach(element => {
                query(q, [element.productSizeId, element.productColorId, element.quantityAvailable, element.id, element.productId]);
            })

            return true;
        } catch (err) {
            return false;
        }
    }
}