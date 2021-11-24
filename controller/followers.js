const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    addFollower: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }
        
        if (input.designerId == null || input.shopperId == null) {
            res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        }

        let followerExist = await db_operations.followers.getFollower(input.designerId, input.shopperId)
        if (followerExist != null && followerExist.length > 0) {
            res.json(utils.sendResponse(true, 200, "Follower is added."));
            return;
        }

        let result = await db_operations.followers.addFollower(input.designerId, input.shopperId);
        if (result != null) {
            res.json(utils.sendResponse(true, 200, "Follower is added."));
            return;
        }
        return res.json(utils.sendResponse(false, 500, "Opps! Something went wrong."));
    },
    deleteFollower: async function (req, res) {
        input = req.body;
        token = req.headers['token'];
        if (token == null) {
            return res.json(utils.sendResponse(false, 500, "Token is required for authorization"))
        }

        let validateTokenResult = await db_operations.validate.validateToken(token);
        if (validateTokenResult == false) {
            return res.json(utils.sendResponse(false, 403, "User is not authorized"));
        }
        
        if (input.designerId == null || input.shopperId == null) {
            res.json(utils.sendResponse(false, 404, "Parameter(s) are missing"));
            return;
        }

        let result = await db_operations.followers.deleteFollower(input.designerId, input.shopperId);
        if (result != false) {
            res.json(utils.sendResponse(true, 200, "Follower is removed."));
            return;
        }
        return res.json(utils.sendResponse(false, 500, "Opps! Something went wrong."));
    },
}