CREATE DATABASE EmployeeTrackerDB;

USE EmployeeTrackerDB;

/*Employee table*/
CREATE TABLE employee(
	id INT AUTO_INCREMENT PRIMARY KEY,
	first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);

/*Roles*/
CREATE TABLE roles(
	id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department(id)
);


/*Department*/
CREATE TABLE department(
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30)
);