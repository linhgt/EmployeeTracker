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
    //Start the connection
    start();
});

//Handle main menu's actions
function start(){
    inquirer.prompt([
        {
            //Initial menu
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
                case "View all employees":
                    break;
                case "View all departments":
                    break;
                case "View all roles":
                    break;
                case "Add employee":
                    addEmployee();
                    break;
                case "Add department":
                    break;
                case "Add role":
                    break;
                case "Update role":
                    break;
                case "Exit":
                    //End the connection
                    connection.end();
                    break;
            }
    });
};

//View all employees
function viewEmployee(){
    var query = "SELECT * FROM employee"
    connection.query(query, function(err, res){
        for(let i = 0; i < res.length; i++)
        {

        }
    });
}

//Add a new employee to the database
function addEmployee(){
    inquirer.prompt([
        {
            //First name
            type:"input",
            name:"firstName",
            message:"First name of the employee:"
        },
        {
            //Last name
            type:"input",
            name:"lastName",
            message:"Last name of the employee:"
        },
        {
            //Role
            type:"input",
            name:"role",
            message:"Role of the employee:"
        },
        {
            //Manager
            type:"input",
            name:"manager",
            message:"Manager of the employee:",
            when: (answer) => answer.role !== 'manager'
        }
    ]).then(answer => {
        console.log("test");
        start();
    });
}