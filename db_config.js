var mysql = require('mysql');

console.log(process.env.HOST + process.env.USRNAME + process.env.password + process.env.DATABASE)

var connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USRNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});


connection.connect(function (err) {
    if (err) throw "Connection not established";
    console.log("Connected Successfully!!!");
});

module.exports = connection
