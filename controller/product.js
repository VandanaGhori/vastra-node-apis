const db_operations = require("../db_operations");

module.exports = {
    getAllProducts: function (req, res) {
        let products = db_operations.product.getAllData("product", function (err, products) {
            if (!err) {
                res.json(products);
            } else {
                console.log(err);
            }
        });
    },
    getProductWithId: {
        
    }
};