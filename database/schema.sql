CREATE DATABASE vehicle_rental_db;

USE vehicle_rental_db;

CREATE TABLE USER_ACC (
    user_id VARCHAR(20) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE CUSTOMER (
    customer_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(15),
    dob DATE,
    FOREIGN KEY (user_id)
        REFERENCES USER_ACC(user_id)
);

CREATE TABLE BRANCH (
    branch_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255)
);

CREATE TABLE VEHICLE (
    plate_number VARCHAR(20) PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT,
    color VARCHAR(30),
    branch_id VARCHAR(20),
    FOREIGN KEY (branch_id)
        REFERENCES BRANCH(branch_id)
);

CREATE TABLE RENTAL (
    rental_id VARCHAR(20) PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    pickup_loc VARCHAR(255),
    return_loc VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    FOREIGN KEY (customer_id)
        REFERENCES CUSTOMER(customer_id),
    FOREIGN KEY (plate_number)
        REFERENCES VEHICLE(plate_number)
);

CREATE TABLE PAYMENT (
    payment_id VARCHAR(20) PRIMARY KEY,
    rental_id VARCHAR(20) UNIQUE NOT NULL,
    payment_date DATE,
    payment_status VARCHAR(30),
    amount DECIMAL(10,2),
    payment_method VARCHAR(30),
    FOREIGN KEY (rental_id)
        REFERENCES RENTAL(rental_id)
);

CREATE TABLE MAINTENANCE (
    maintenance_id VARCHAR(20) PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    maintenance_date DATE,
    maintenance_status VARCHAR(30),
    maintenance_amt DECIMAL(10,2),
    maintenance_type VARCHAR(50),
    FOREIGN KEY (plate_number)
        REFERENCES VEHICLE(plate_number)
);

INSERT INTO USER_ACC
(user_id, email, password, role, created_at)
VALUES
('USR001', 'rahul@gmail.com', 'pass123', 'customer', '2026-10-01 10:00:00'),
('USR002', 'ananya@gmail.com', 'pass456', 'customer', '2026-10-01 10:15:00'),
('USR003', 'admin@gmail.com', 'admin123', 'admin', '2026-10-01 09:00:00');

INSERT INTO CUSTOMER
(customer_id, user_id, name, address, phone, dob)
VALUES
('CUS001', 'USR001', 'Rahul Sharma', 'Bangalore', '9876543210', '2004-05-12'),
('CUS002', 'USR002', 'Ananya Rao', 'Mysore', '9876501234', '2003-08-21');

INSERT INTO BRANCH
(branch_id, name, address)
VALUES
('BR001', 'Bangalore Central', 'MG Road, Bangalore'),
('BR002', 'Electronic City', 'Electronic City, Bangalore');

INSERT INTO VEHICLE
(plate_number, make, type, model, year, color, branch_id)
VALUES
('KA01AB1234', 'Toyota', 'SUV', 'Fortuner', 2023, 'White', 'BR001'),
('KA05CD5678', 'Honda', 'Sedan', 'City', 2022, 'Black', 'BR001'),
('KA51EF9012', 'Hyundai', 'Hatchback', 'i20', 2024, 'Blue', 'BR002');

INSERT INTO RENTAL
(rental_id, customer_id, plate_number, pickup_loc, return_loc, start_date, end_date, status)
VALUES
('REN001', 'CUS001', 'KA01AB1234',
 'Bangalore Central', 'Bangalore Central',
 '2026-10-05', '2026-10-08', 'Completed'),

('REN002', 'CUS002', 'KA05CD5678',
 'Bangalore Central', 'Electronic City',
 '2026-10-10', '2026-10-12', 'Active');

INSERT INTO PAYMENT
(payment_id, rental_id, payment_date, payment_status, amount, payment_method)
VALUES
('PAY001', 'REN001', '2026-10-05', 'Paid', 7500.00, 'UPI'),
('PAY002', 'REN002', '2026-10-10', 'Paid', 4500.00, 'Card');

INSERT INTO MAINTENANCE
(maintenance_id, plate_number, maintenance_date, maintenance_status, maintenance_amt, maintenance_type)
VALUES
('MNT001', 'KA01AB1234', '2026-09-20', 'Completed', 3500.00, 'Service'),
('MNT002', 'KA05CD5678', '2026-09-25', 'Completed', 2200.00, 'Oil Change');
