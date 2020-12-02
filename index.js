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
            type:"list",
            name:"role",
            message:"Role of the employee:",
            choices:[
                "Sales Lead",
                "Saleperson",
                "Lead Engineer",
                "Software Engineer",
                "Accountant",
                "Legal Team Lead",
                "Lawyer"
            ]
        },
        {
            //Manager
            type:"input",
            name:"manager",
            message:"Manager of the employee:"
        }
    ]).then(answer => {
        let roleId = 0;         //Store retrieved roleId
        let managerId = 0;

        //Query retrieving role id from the roles table
        //Based on input role
        let roleQuery = "SELECT id FROM roles WHERE title = ?;";
        connection.query(roleQuery, [answer.role], function(err,res){
            if (err){
                throw err;
            }
            roleId = res[0].id;
            //function to retrieve managerId
            findManager(answer.firstName, answer.lastName, roleId, answer.manager);
        });

        /*//Retrieve Manager Id if there is a manager
        if(answer.manager !== "")
        {
            let managerArr = answer.manager.split(" ");
            let managerQuery = "SELECT id FROM employee WHERE first_name = ? AND last_name = ?";
            connection.query(managerQuery, [managerArr[0], managerArr[1]], function(err, res){
                if (err) throw err;
                managerId = res[0].id;
            });
        }
        
        //Insert query
        let employeeQuery = "INSERT INTO employee SET ?";
        connection.query(employeeQuery,
            {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id:roleId,
                manager_id:managerId   
            }, 
            function(err, res){
            if (err) throw err;
            console.log(roleId + "\n");
            console.log("Successfully inserted!");
        });
        start();*/
    });
}

//Function to retrieve managerId
function findManager(firstName, lastName, roleId, manager){
    let managerId;

    //If there is a manager
    if(manager !== "")
    {
        //Split manager name into first name and last name
        let managerArr = manager.split(" ");
        let managerQuery = "SELECT id FROM employye WHERE first_name = ? AND last_name = ?;";
        connection.query(managerQuery, [managerArr[0], managerArr[1]], function(err, res){
            if (err){
                throw err;
            }
            //Pass managerId to insert function
            managerId = res[0].id;
            insertEmployee(firstName, lastName, roleId, managerId);
        });
    }
    else
    {
        //Insert employee without managerId
        insertEmployee(firstName, lastName, roleId, 0);
    }
};

//Insert employee into the database
function insertEmployee(firstName, lastName, roleId, managerId)
{
    //Pass null in managerId column if there is no manager
    if(managerId ==0)
    {
        managerId = null;
    }
    let insertQuery = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);";
    connection.query(insertQuery, [firstName, lastName, roleId, managerId], function(err,res){
        if (err){
            throw err;
        }
        console.log("Successfully inserted!");
        start();
    });
}