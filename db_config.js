var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "vastra"
});

connection.connect(function (err) {
    if (err) throw "Connection not established";
    console.log("Connected Successfully!!!");
});

module.exports = connection
