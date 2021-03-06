var inquirer = require("inquirer");
var mysql = require("mysql");
var consoleTable = require("console.table");

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
                        "View all employees", 
                        "View all departments", 
                        "View all roles",
                        "View employees by manager", 
                        "Add employee", 
                        "Add department", 
                        "Add role", 
                        "Update employee role",
                        "Update employee manager",
                        "Delete employee",
                        "Delete role",
                        "Delete department",
                        "Exit"
                    ]
        }
    ]).then(answer => {
            switch(answer.action){
                case "View all employees":
                    viewEmployees();
                    break;
                case "View all departments":
                    viewDepartments();
                    break;
                case "View all roles":
                    viewRoles();
                    break;
                case "View employees by manager":
                    viewEmpByMnger();
                    break;
                case "Add employee":
                    addEmployee();
                    break;
                case "Add department":
                    addDepartment();
                    break;
                case "Add role":
                    addRole();
                    break;
                case "Update employee role":
                    updateEmployeeRoles();
                    break;
                case "Update employee manager":
                    updateManager();
                    break;
                case "Delete employee":
                    deleteEmployee();
                    break;
                case "Delete role":
                    deleteRole();
                    break;
                case "Delete department":
                    deleteDepartment();
                    break;
                case "Exit":
                    //End the connection
                    connection.end();
                    break;
            }
    });
};

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
            console.log(res);
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
        let managerQuery = "SELECT id FROM employee WHERE first_name = ? AND last_name = ?;";
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
        console.log(`\nSuccessfully inserted ${firstName} ${lastName}!\n`);
        start();
    });
}

//Add new department into the database
function addDepartment(){
    inquirer.prompt([
        {
            type:"input",
            name:"department",
            message:"What is the name of the department?"
        }
    ]).then(answer =>{
        //If users enter a valid input
        if(answer.department !== "")
        {
            let Query = "INSERT INTO department (name) VALUES (?);";
            connection.query(Query, [answer.department], function(err, res){
                if (err) throw err;
                console.log(`\nSuccessfully inserted ${answer.department}\n!`);
                start();
            });
        }
        else
        {
            console.log("\nPlease specify a department name!\n");
            start();
        }
    });
}

//Add new role to the database
function addRole(){
    let departmentChoices = [];     //Store department names
    let departments = {};           //Store department IDs
    let departmentId;               //Id for query

    let roleQuery = "SELECT * FROM department;";
    connection.query(roleQuery, function(err, res){
        if (err) throw err;
        //Store the name of the department temporarily
        for(let i = 0; i < res.length; i++)
        {
            let obj = res[i];
            departmentChoices.push(obj.name);
            departments[obj.name] = obj.id;
        }
        inquirer.prompt([
            {
                type:"list",
                name:"department",
                message:"Which department is this role belonged to?",
                choices:departmentChoices
            },
            {
                type:"input",
                name:"title",
                message:"What's the title of the role?"
            },
            {
                type:"input",
                name:"salary",
                message:"What's the salary for this role?"
            }
        ]).then(answer =>{
            //Retrieve department id
            departmentId = departments[answer.department];

            let Query = "INSERT INTO roles (title, salary, department_id) VALUES(?, ?, ?);";
            connection.query(Query, [answer.title, answer.salary, departmentId], function(error, response){
                if(error) throw error;
                console.log(`\nSuccessfull inserted ${answer.title}!\n`);
                start();
            })
        });
    });
};

//View all employees
function viewEmployees(){
    let Query = "SELECT E1.id, E1.first_name, E1.last_name, title, name AS department, salary, concat(E2.first_name, ' ', E2.last_name) AS manager ";
        Query += "FROM employee AS E1 LEFT JOIN roles ON E1.role_id = roles.id LEFT JOIN "
        Query += "department ON roles.department_id = department.id LEFT JOIN employee AS E2 ON E1.manager_id = E2.id;"

    //let Query = "SELECT E1.id, E1.first_name, E1.last_name, title, name AS department, salary, concat(E2.first_name, ' ', E2.last_name) AS manager FROM employee AS E1 LEFT JOIN roles ON E1.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id LEFT JOIN employee AS E2 ON E1.manager_id = E2.id;";

    //let Query2 = "SELECT e.id, e.first_name, e.last_name, r.title as role, d.name AS department, r.salary, concat(e2.first_name, SPACE(1), e2.last_name) AS manager FROM employee e LEFT JOIN employee e2 ON (e.manager_id = e2.id OR e.manager_id = null) LEFT JOIN role r ON (e.role_id = r.id or e.role_id = null) LEFT JOIN department d ON (r.department_id = d.id OR r.department_id = null)";

    connection.query(Query, function (err, res){
        if (err) throw err;
        console.log("\r\n");
        console.table(res);
        start();
    });
};

//View all departments
function viewDepartments(){
    let Query = "SELECT * FROM department;";
    
    connection.query(Query, function(err, res){
        if (err) throw err;
        console.log("\r\n");
        console.table(res);
        start();
    }); 
};

//View all roles
function viewRoles(){
    let Query = "SELECT roles.id, title, salary, name AS department FROM roles LEFT JOIN department on roles.department_id = department.id;";
    
    connection.query(Query, function(err, res){
        if (err) throw err;
        console.log("\r\n");
        console.table(res);
        start();
    });
};

//Update employee's role
function updateEmployeeRoles(){
    let roles = [];
    let roleId = {};
    let roleQuery = "SELECT id, title FROM roles;"
    
    connection.query(roleQuery, function(err, res){
        if (err) throw err;

        //Iterate through the roles
        for(let i = 0; i < res.length; i++)
        {
            roles.push(res[i].title);
            roleId[res[i].title] = res[i].id;
        }

        inquirer.prompt([
            {    
                type:"input",
                name:"employee",
                message:"What's the name of the employee?"
            },
            {
                type:"list",
                name:"newRole",
                message:"What is the new role?",
                choices:roles
            }
        ]).then(answer => {
            update(answer, roleId);
        });
    });
};

//Update role
function update(answer, roleId){
    let updateQuery = "UPDATE employee SET role_id = ? WHERE concat(first_name, ' ',last_name) like ?;";

    connection.query(updateQuery, [roleId[answer.newRole], answer.employee], function(err, res){
        if (err) throw err;
        console.log("\r\n");
        console.log(`Successfully updated role for ${answer.employee}`);
        start();
    });
}

//Update employee manager
function updateManager(){
    inquirer.prompt([
        {
            type:"input",
            name:"employee",
            message:"Which employee do you want to update manager?"
        },
        {
            type:"input",
            name:"manager",
            message:"Who is the new manager?"
        }
    ]).then(answer => {
        let managerId = null;      //New manager id
        let managerQuery = "SELECT id FROM employee WHERE concat(first_name, ' ',last_name) like ?;";

        connection.query(managerQuery, [answer.manager], function(err, res){
            if(err) throw err;
            //Check if anyone has this employee as a manager
            if(res.length !== 0)
            {
                managerId = res[0].id;
            }
            updateManagerId(answer.employee, managerId);
        });
    });
}

function updateManagerId(employee, managerId){
    let employeeQuery = "UPDATE employee set manager_id = ? WHERE concat(first_name, ' ',last_name) like ?;";

    //If managerId is null, then the new manager is not valid
    //Table is still updated, but the manager will be null
    connection.query(employeeQuery, [managerId, employee], function(err, res){
        if (err) throw err;
        if(res.affectedRows == 0)
        {
            console.log("\r\nNo such employee exists\n");
        }
        else{
            console.log("\r\n");
            console.log(`Success! ${employee}'s manager has been updated`);
        }
        start();
    });
};

//Delete an employee
function deleteEmployee(){
    inquirer.prompt([
        {
            type:"input",
            name:"employee",
            message:"Who do you want to delete?"
        }
    ]).then(answer =>{
        //let Query = "DELETE FROM employee WHERE concat(first_name, ' ', last_name) like ?);";
        let Query = "SELECT id FROM employee WHERE concat(first_name, ' ', last_name) like ?;"

        //Retrieve the employee's id first before deleting
        connection.query(Query, [answer.employee], function(err,res){
            if(err) throw err;
            deleteEmp(res[0].id, answer.employee);
        });
    });
};

function deleteEmp(employeeId, employee)
{
    //Delete the employee from the database
    let Query = "DELETE FROM employee WHERE concat(first_name, ' ', last_name) like ?;";
    connection.query(Query, [employee], function(err, res){
        if (err) throw err;
        if(res.affectedRows == 0)
        {
            console.log("\r\n");
            console.log("No record deleted for there is no such employee\n");
        }
        else
        {
            console.log("\r\n");
            console.log(`Successfully deleted ${employee}`);
            start();
        }
    });

    //Update the manager of any employee that has deleted employee as the manager
    let managerQuery = "UPDATE employee SET manager_id = null WHERE manager_id = ?;";
    connection.query(managerQuery, [employeeId], function(err,res){
        if (err) throw err;
    });
}

//Delete role
function deleteRole(){
    let roleId = {};        //Store each roles id
    let roles = [];         //Store the names of the roles

    let roleQuery = "SELECT id, title FROM roles;";

    connection.query(roleQuery, function(err, res){
        if (err) throw err;

        //Iterate through the roles
        for (let i = 0; i < res.length; i++)
        {
            roles.push(res[i].title);
            roleId[res[i].title] = res[i].id;
        };

        inquirer.prompt([
            {
                type:"list",
                name:"role",
                message:"which role you want to remove?",
                choices:roles
            }
        ]).then(answer =>{
            //Update any employees who has this role first
            deleteR(answer.role, roleId[answer.role]);
        });
    });
};

/*function updateEmpRole(role, roleId){
    //Update roles of any employees who has this role
    let updateEmpRoleQuery = "UPDATE employee SET role_id = null WHERE role_id = ?;";
    connection.query(updateEmpRoleQuery, [roleId], function(err,res){
        if (err) throw err;
        deleteR(role, roleId);
    });
};*/

function deleteR(role, roleId){
    let deleteRoleQuery = "DELETE FROM roles WHERE id = ?;";

    //Remove role from the database
    connection.query(deleteRoleQuery, [roleId], function(err, res){
        if (err) throw err;
        if(res.affectedRows == 0)
        {
            console.log("\nNo such role exists.\n");
        }
        else
        {
            console.log(`\nSuccessfully delete ${role}\n`);
        }
        start();
    });
}

//Delete department
function deleteDepartment(){
    let departments = [];       //Store the department names
    let departmentId = {};      //Store the department IDs

    let Query = "SELECT * FROM department;";

    connection.query(Query, function(err, res){
        if (err) throw err;

        //Iterate through the departments
        for(let i = 0; i < res.length; i++)
        {
            departments.push(res[i].name);
            departmentId[res[i].name] = res[i].id;
        }

        inquirer.prompt([
            {
                type:"list",
                name:"department",
                message:"Which department you want to remove?",
                choices:departments
            }
        ]).then(answer =>{
            //Delete the department
            deleteDept(answer.department, departmentId[answer.department]);
        });
    });
}

//Delete the department
function deleteDept(department, departmentId)
{
    //Remove roles associated with the deleted department
    let roleQuery = "DELETE FROM roles WHERE department_id = ?;";
    connection.query(roleQuery, [departmentId], function(err,res){
        if (err) throw err;
        console.log(`\r\nSuccessfully removed ${department}!\n`);
        start();
    });
}

//View employees by manager
function viewEmpByMnger(){
    inquirer.prompt([
        {
            type:"input",
            name:"manager",
            message:"Which manager do you want to view employee?"
        }
    ]).then(answer => {
        let Query = "SELECT E1.id, E1.first_name, E1.last_name, title, name AS department, salary, concat(E2.first_name, ' ', E2.last_name) AS manager ";
        Query += "FROM employee AS E1 LEFT JOIN roles ON E1.role_id = roles.id LEFT JOIN ";
        Query += "department ON roles.department_id = department.id LEFT JOIN employee AS E2 ON E1.manager_id = E2.id AND concat(E2.first_name, ' ', E2.last_name) like ?;";

        connection.query(Query, [answer.manager], function(err, res){
            if(err) throw err;
            if(res.affectedRows == 0)
            {
                //If there is no such manager or that employee is not manager of anyone
                console.log(`No one has ${answer.manager} as manager`);
            }
            else
            {
                console.table(res);
            }
            start();
        });
    });
};