var inquirer = require("inquirer")
var mysql = require("mysql");

//Create mysql connection
var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "Hoanhtrang@123",
    database: "employeetrackerdb"
});

connection.connect(function(err){
    if(err) throw err;
    start();
});

function start(){
    inquirer.prompt([
        {
            type:"list",
            message:"What would you like to do?",
            name:"action",
            choices:[
                        "View employee", 
                        "View department", 
                        "View role", 
                        "Add employee", 
                        "Add department", 
                        "Add role", 
                        "Update roles",
                        "Exit"
                    ]
        }
    ]).then(answer => {
            switch(answer.action){
                case "View employee":
                    break;
                case "View department":
                    break;
                case "View role":
                    break;
                case "Add employee":
                    break;
                case "Add department":
                    break;
                case "Add role":
                    break;
                case "Update role":
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
    });
};