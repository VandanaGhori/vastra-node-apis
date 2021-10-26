const { json } = require("express");
const db_operations = require("../db_operations");
var utils = require('../utils');

module.exports = {
    getColors: async function (req,res) {
        let getColorsResponse = await db_operations.color.getAllColors("color");
        if(getColorsResponse != false) {
            res.json(utils.sendResponse(true, 200, "All Colors", getColorsResponse));
            return;
        } else {
            return res.json(utils.sendResponse(false, 500, "Opps something went wrong"));
        }
    }
}