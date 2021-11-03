const db_operations = require("../db_operations");
var utils = require('../utils');


module.exports = {
    getAllProducts: async function (req, res) {
        let productResponse = await db_operations.product.getAllProducts("product");
        if (productResponse != false) {
            res.json(utils.sendResponse(false, 200, "All the Products", productResponse));
            return;
        }
        return res.json(utils.sendResponse(false, 500, "Oops something went wrong"));
    },
    createProduct: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        if (input.designerId == null || input.catalogueId == null || input.typeId == null ||
            input.title == null || input.description == null || input.images == null || input.price == null ||
            input.multipackSet == null || input.weight == null || input.pattern == null ||
            input.knitOrWoven == null || input.washCare == null || input.colors == null ||
            input.occasions == null || input.seasons == null || input.sizes == null ||
            input.materials == null) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        var date = new Date();
        let product = {
            'designerId': input.designerId,
            'catalogueId': input.catalogueId,
            'typeId': input.typeId,
            'title': input.title,
            'description': input.description,
            'images': JSON.stringify(input.images),
            'price': input.price,
            'multipackSet': input.multipackSet,
            'weight': input.weight,
            'pattern': input.pattern,
            'knitOrWoven': input.knitOrWoven,
            'washCare': input.washCare,
            'trend': input.trend,
            'isDeleted': false,
            'totalLikes': 0,
            'overallRating': 0,
            'createdAt': date.toISOString().slice(0, 19).replace('T', ' ')
        }
        var productObj = Object.values(product);
        let addProductResponse = await db_operations.product.addProduct(productObj);
        if (addProductResponse == null) {
            return res.json(utils.sendResponse(false, 500, "Something went wrong in adding product."));
        }

        let productId = addProductResponse.insertId;

        let insertedProduct = await db_operations.product.getProductById(productId);
        if (insertedProduct == null) {
            return res.json(utils.sendResponse(false, 500, "Product is not added."));
        }

        insertedProduct.images = JSON.parse(insertedProduct.images);

        // occasions
        let resProductOccasions = await db_operations.productOccasion.addProductOccasions(productId, input.occasions);
        if (resProductOccasions == false) {
            await db_operations.product.deleteProduct(productId);
            console.log("error occasions")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product occasions."));
        }

        // seasons
        let resProductSeasons = await db_operations.productSeasons.addProductSeasons(productId, input.seasons);
        if (resProductSeasons == false) {
            await db_operations.product.deleteProduct(productId);
            console.log("error seasons")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product seasons."));
        }

        // materials
        await Promise.all(input.materials.map(async (element) => {
            if (element.materialId == 0) {
                let materialExist = await db_operations.material.isMaterialExist("material", element.materialName);
                if (materialExist != false && materialExist != undefined) {
                    element.materialId = materialExist.id;
                } else {
                    let addMaterialResponse = await db_operations.material.addMaterial("material", element.materialName);
                    if (addMaterialResponse != false) {
                        element.materialId = addMaterialResponse.insertId;
                    } else {
                        return res.json(utils.sendResponse(false, 500, "Something went wrong on materials."));
                    }
                }
            }
        }))
        let resProductMaterials = await db_operations.productMaterials.addProductMaterials(productId, input.materials);
        if (resProductMaterials == false) {
            await db_operations.product.deleteProduct(productId);
            console.log("error product materials")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product materials."));
        }

        // colors
        let resProductColors = await db_operations.productColors.addProductColors(productId, input.colors);
        if (resProductColors == false) {
            await db_operations.product.deleteProduct(productId);
            console.log("error colors")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product colors."));
        }
        insertedProduct.colors = await db_operations.productColors.getAllProductColors(productId);

        // sizes
        let resProductSizes = await db_operations.productSizes.addProductSizes(productId, input.sizes);
        if (resProductSizes == false) {
            await db_operations.product.deleteProduct(productId);
            console.log("error sizes")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product sizes."));
        }
        insertedProduct.sizes = await db_operations.productSizes.getAllProductSizes(productId);

        return res.json(utils.sendResponse(true, 200, "Product is added", insertedProduct));
    }
};