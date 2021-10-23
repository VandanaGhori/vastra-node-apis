const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    getAllProducts: function (req, res) {
        let products = db_operations.product.getAllData("product", function (err, products) {
            if (err) {
                res.json(utils.sendResponse(false, 404, "Data not found!!!"));
            } else if (!err) {
                if(products != null) {
                    res.json(utils.sendResponse(false, 200, "All the Products",products));
                } 
            }
        });
    },
    getProductWithId: {
        
    }
};