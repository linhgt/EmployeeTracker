var inquirer = require("inquirer")
var mysql = require("mysql");

//Create mysql connection
var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "Hoanhtrang@123",
    database: "EmployeeTrackerDB"
});

connection.connect(function(err){
    if(err) throw err;
    console.log("successfully making connection to mysql database!");
});