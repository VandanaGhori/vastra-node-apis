const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    getAllProducts: async function (req, res) {
        let productResponse = await db_operations.product.getAllProducts("product");
        if (productResponse != false) {
            res.json(utils.sendResponse(true, 200, "All the Products", productResponse));
            return;
        }
        return res.json(utils.sendResponse(false, 500, "Oops something went wrong"));
    },
    getCatalogueProducts: async function (req, res) {
        input = req.query;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        if (input.catalogueId == null) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        let productResponse = await db_operations.product.getCatalogueProducts(input.catalogueId);
        if (productResponse != false) {
            res.json(utils.sendResponse(true, 200, "All the Products", productResponse));
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
    },
    isAnyProductExistForDesigner: async function (req, res) {
        input = req.query;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        if (input.designerId == null) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        let productsResponse = await db_operations.product.getProductsCountByDesignerId(input.designerId);
        let isAnyProductsExist = productsResponse[0].totalProducts > 0
        res.json(utils.sendResponse(true, 200, "", isAnyProductsExist));
        return;
    },
    deleteProduct: async function (req, res) {
        input = req.query;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        if (input.productId == null) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        let deleteResponse = await db_operations.product.deleteProduct(input.productId);
        if (deleteResponse == false) {
            return res.json(utils.sendResponse(false, 500, "Delete unsuccessful"));
        }
        return res.json(utils.sendResponse(true, 200, "Delete unsuccessful"))
    },
    getProduct: async function (req, res) {
        input = req.query;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        if (input.productId == null) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        let product = await db_operations.product.getProductById(input.productId);
        if (product == null) {
            return res.json(utils.sendResponse(false, 500, "Product does not exist"));
        }

        product.images = JSON.parse(product.images);
        
        product.productType = await db_operations.productType.getProductType(product.typeId);

        product.occasions = await db_operations.productOccasion.getProductOccasions(product.id);

        product.materials = await db_operations.productMaterials.getProductMaterials(product.id);

        product.seasons = await db_operations.productSeasons.getProductSeasons(product.id);

        product.colors = await db_operations.productColors.getAllProductColors(product.id);

        product.sizes = await db_operations.productSizes.getAllProductSizes(product.id);

        product.inventories = await db_operations.productInventory.getProductInventories(product.id);

        return res.json(utils.sendResponse(true, 200, "Product info", product));
    },
    getFilteredProducts: async function(req, res) {
        input = req.body;

        token = req.headers['token'];
        if(token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        let filteredProductsResponse = await db_operations.product.getFilteredProducts(input);

        //console.log("filteredProducts List " + filteredProductsResponse);

        if(filteredProductsResponse == null || filteredProductsResponse == undefined) {
            filteredProductsResponse = [];
        }
        
        if(filteredProductsResponse.length == 0 || filteredProductsResponse == []) {
            return res.json(utils.sendResponse(true, 500, "No matched product found.", filteredProductsResponse));   
        }

        for(let i = 0; i<filteredProductsResponse.length; i++) {
            filteredProductsResponse[i].images = JSON.parse(filteredProductsResponse[i].images);
            if(filteredProductsResponse[i].isUserLiked == 1) {
                filteredProductsResponse[i].isUserLiked = true;
            } else {
                filteredProductsResponse[i].isUserLiked = false;
            }
        }

        if(filteredProductsResponse != false && filteredProductsResponse.length > 0) {
            res.json(utils.sendResponse(true, 200, "All the Filtered Products", filteredProductsResponse));
            return;
        }

        return res.json(utils.sendResponse(false, 500, "Oops something went wrong with filtered products"));
    },
    updateProduct: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        if (input.id == null || input.catalogueId == null || input.typeId == null ||
            input.title == null || input.description == null || input.images == null || input.price == null ||
            input.multipackSet == null || input.weight == null || input.pattern == null || input.knitOrWoven == null ||
            input.washCare == null || input.occasions == null || input.seasons == null || input.materials == null) {
            return res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
        }

        let existingProduct = await db_operations.product.getProductById(input.id);
        if (existingProduct == null) {
            return res.json(utils.sendResponse(false, 500, "Product does not exist."));
        }

        var date = new Date();
        let product = {
            'id': input.id,
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
            'updatedAt': date.toISOString().slice(0, 19).replace('T', ' ')
        }
        // var productObj = Object.values(product);
        let resObj = await db_operations.product.updateProduct(product);
        if (resObj == null) {
            return res.json(utils.sendResponse(false, 500, "Something went wrong in updating product."));
        }

        let productId = product.id;

        // occasions
        let resDeleteOccasions = await db_operations.productOccasion.deleteProductOccasions(productId);
        if (resDeleteOccasions == false) {
            console.log("error delete occasions")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product occasions."));
        }
        let resAddOccasions = await db_operations.productOccasion.addProductOccasions(productId, input.occasions);
        if (resAddOccasions == false) {
            console.log("error update occasions")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product occasions."));
        }

        // seasons
        let resDeleteSeasons = await db_operations.productSeasons.deleteProductSeasons(productId);
        if (resDeleteSeasons == false) {
            console.log("error delete seasons")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product seasons."));
        }
        let resAddSeasons = await db_operations.productSeasons.addProductSeasons(productId, input.seasons);
        if (resAddSeasons == false) {
            console.log("error update seasons")
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
        let resDeleteMaterials = await db_operations.productMaterials.deleteProductMaterials(productId);
        if (resDeleteMaterials == false) {
            console.log("error delete product materials")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product materials."));
        }
        let resAddMaterials = await db_operations.productMaterials.addProductMaterials(productId, input.materials);
        if (resAddMaterials == false) {
            console.log("error update product materials")
            return res.json(utils.sendResponse(false, 500, "Something went wrong on product materials."));
        }

        return res.json(utils.sendResponse(true, 200, "Product is updated"));
    },
    getProductFeeds: async function (req, res) {
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"));
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if(validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }

        let response = await db_operations.validate.getUserIdFromToken(token);
        if(response == false) {
            return res.json(utils.sendResponse(false, 500, "Oops something went wrong with token"));
        }

        //console.log("User Id = " + response[0]['userId']);

        let getProductFeedsResponse = await db_operations.product.getProductFeeds(response[0]['userId']);

        //console.log("getProductFeedsResponse = " + getProductFeedsResponse);

        if(getProductFeedsResponse.length == 0 || getProductFeedsResponse == []) {
            return res.json(utils.sendResponse(false, 500, "No product found. Follow designers to see latest feed."));   
        }
        
        for(let i = 0; i<getProductFeedsResponse.length; i++) {
            getProductFeedsResponse[i].images = JSON.parse(getProductFeedsResponse[i].images);
            if(getProductFeedsResponse[i].isUserLiked == 1) {
                getProductFeedsResponse[i].isUserLiked = true;
            } else {
                getProductFeedsResponse[i].isUserLiked = false;
            }
        }

        if(getProductFeedsResponse != false && getProductFeedsResponse.length > 0) {
            res.json(utils.sendResponse(true, 200, "All the latest feed", getProductFeedsResponse));
            return;
        }

        return res.json(utils.sendResponse(false, 500, "Oops something went wrong with feed"));
    }
};