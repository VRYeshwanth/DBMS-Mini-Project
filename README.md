# 🚗 Vehicle Rental Management System

A university **DBMS Mini-Project** implementing the backend of a Vehicle Rental Management System using **Node.js, Express.js, and MySQL**. The current version focuses on the **REST API backend**, including authentication, vehicle management, rentals, payments, maintenance, branch management, customer management, and an admin dashboard.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MySQL
* **Authentication:** JWT
* **Database Driver:** MySQL2
* **API Testing:** Postman

---

## 📁 Project Structure

```text
DBMS-Mini-Project/
├── backend/
│   ├── package-lock.json
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── branchController.js
│       │   ├── customerController.js
│       │   ├── dashboardController.js
│       │   ├── maintenanceController.js
│       │   ├── paymentController.js
│       │   ├── rentalController.js
│       │   └── vehicleController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── roleMiddleware.js
│       ├── models/
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── branchRoutes.js
│       │   ├── customerRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── maintenanceRoutes.js
│       │   ├── paymentRoutes.js
│       │   ├── rentalRoutes.js
│       │   └── vehicleRoutes.js
│       ├── server.js
│       └── services/
├── images/
│   ├── ER Diagram.png
│   └── Relational Model.png
└── README.md
```

### 📌 Backend Structure

| Directory/File     | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `src/config/`      | Database configuration                      |
| `src/controllers/` | Business logic for API endpoints            |
| `src/middleware/`  | Authentication and role-based authorization |
| `src/models/`      | Reserved for database models                |
| `src/routes/`      | API route definitions                       |
| `src/services/`    | Reserved for reusable service-layer logic   |
| `app.js`           | Express application configuration           |
| `server.js`        | Starts the backend server                   |

---

## 🗄️ Database Design

The backend is built around seven MySQL relations:

* `USER_ACC`
* `CUSTOMER`
* `BRANCH`
* `VEHICLE`
* `RENTAL`
* `PAYMENT`
* `MAINTENANCE`

The database uses primary keys, foreign keys, unique constraints, and other integrity constraints. The database design is normalized to **BCNF**.

The complete ER diagram and relational model are available in the `images/` directory.

---

# 🔐 API Endpoints

All endpoints are prefixed with `/api`.

Authentication-protected endpoints require a JWT:

```http
Authorization: Bearer <token>
```

### 👥 Access Levels

| Role       | Description                                |
| ---------- | ------------------------------------------ |
| `Public`   | No authentication required                 |
| `Customer` | Requires an authenticated customer account |
| `Admin`    | Requires an authenticated admin account    |

---

## 🔑 Authentication

| Method | Endpoint             | Description                                     | Access           |
| ------ | -------------------- | ----------------------------------------------- | ---------------- |
| `POST` | `/api/auth/register` | Register a new customer account                 | Public           |
| `POST` | `/api/auth/login`    | Authenticate a user and obtain a JWT            | Public           |
| `GET`  | `/api/auth/me`       | Get details of the currently authenticated user | Customer / Admin |

---

## 🚗 Vehicle Endpoints

| Method   | Endpoint                     | Description                       | Access |
| -------- | ---------------------------- | --------------------------------- | ------ |
| `GET`    | `/api/vehicles`              | Get all vehicles                  | Admin  |
| `GET`    | `/api/vehicles/available`    | Get currently available vehicles  | Public |
| `GET`    | `/api/vehicles/:plateNumber` | Get details of a specific vehicle | Public |
| `POST`   | `/api/vehicles`              | Add a new vehicle                 | Admin  |
| `PUT`    | `/api/vehicles/:plateNumber` | Update vehicle details            | Admin  |
| `DELETE` | `/api/vehicles/:plateNumber` | Delete a vehicle                  | Admin  |

Vehicle availability is derived from the rental and maintenance data rather than being stored as a separate attribute.

---

## 👤 Customer Endpoints

| Method | Endpoint                     | Description                                      | Access   |
| ------ | ---------------------------- | ------------------------------------------------ | -------- |
| `GET`  | `/api/customers/me/rentals`  | Get rental history of the authenticated customer | Customer |
| `GET`  | `/api/customers`             | Get all customers                                | Admin    |
| `GET`  | `/api/customers/:customerId` | Get details and rental history of a customer     | Admin    |

---

## 🚘 Rental Endpoints

| Method | Endpoint                 | Description                      | Access           |
| ------ | ------------------------ | -------------------------------- | ---------------- |
| `POST` | `/api/rentals`           | Create a new rental              | Customer         |
| `GET`  | `/api/rentals`           | Get rentals                      | Admin            |
| `GET`  | `/api/rentals/:rentalId` | Get details of a specific rental | Customer / Admin |

Rental creation validates:

* Customer authentication
* Vehicle existence
* Active maintenance
* Conflicting active rentals
* Valid rental dates

Rental status uses only:

```text
Active
Completed
```

Completed rentals are automatically updated by a **MySQL Event Scheduler** based on their end date.

---

## 💳 Payment Endpoints

| Method | Endpoint                   | Description                       | Access           |
| ------ | -------------------------- | --------------------------------- | ---------------- |
| `POST` | `/api/payments`            | Record payment for a rental       | Customer / Admin |
| `GET`  | `/api/payments`            | Get payment records               | Admin            |
| `GET`  | `/api/payments/:paymentId` | Get details of a specific payment | Customer / Admin |

Payment rules:

* Payment status is always `Paid`
* Each rental can have only one payment
* Payment methods:

  * `UPI`
  * `Card`
  * `Cash`
* Payment amount must be greater than zero

---

## 🔧 Maintenance Endpoints

| Method   | Endpoint                          | Description                       | Access |
| -------- | --------------------------------- | --------------------------------- | ------ |
| `POST`   | `/api/maintenance`                | Add a maintenance record          | Admin  |
| `GET`    | `/api/maintenance`                | Get maintenance records           | Admin  |
| `GET`    | `/api/maintenance/:maintenanceId` | Get a specific maintenance record | Admin  |
| `PUT`    | `/api/maintenance/:maintenanceId` | Update maintenance details        | Admin  |
| `DELETE` | `/api/maintenance/:maintenanceId` | Delete a maintenance record       | Admin  |

The backend prevents a vehicle with an active rental from being placed into active maintenance.

---

## 🏢 Branch Endpoints

| Method   | Endpoint                  | Description             | Access |
| -------- | ------------------------- | ----------------------- | ------ |
| `POST`   | `/api/branches`           | Create a branch         | Admin  |
| `GET`    | `/api/branches`           | Get all branches        | Admin  |
| `GET`    | `/api/branches/:branchId` | Get details of a branch | Admin  |
| `PUT`    | `/api/branches/:branchId` | Update branch details   | Admin  |
| `DELETE` | `/api/branches/:branchId` | Delete a branch         | Admin  |

---

## 📊 Admin Dashboard

| Method | Endpoint         | Description                            | Access |
| ------ | ---------------- | -------------------------------------- | ------ |
| `GET`  | `/api/dashboard` | Get dashboard statistics and summaries | Admin  |

The dashboard currently provides:

* Total vehicles
* Available vehicles
* Total customers
* Active rentals
* Active maintenance
* Total revenue
* Revenue by branch
* Rentals by vehicle
* Maintenance cost by vehicle

The dashboard uses SQL aggregation, joins, grouping, and derived data.

---

# 🔒 Authentication & Authorization

The backend uses **JWT-based authentication**. The general authentication flow is:

```text
Login
  ↓
Credentials verified
  ↓
JWT generated
  ↓
Client stores token
  ↓
Token sent with protected requests
  ↓
authMiddleware.js
  ↓
roleMiddleware.js
  ↓
Controller
```

Role-based authorization supports two roles:

```text
customer
admin
```

Customers cannot access admin-only endpoints, and administrative operations are protected by role-based middleware.

---

# 🧠 Database Features

The project is designed to demonstrate DBMS concepts rather than functioning as a simple CRUD application.

The backend/database currently uses:

* Primary keys
* Foreign keys
* Unique constraints
* Referential integrity
* SQL joins
* Aggregate queries
* Transactions
* MySQL Event Scheduler
* Role-based access through the backend

### ⚙️ Automatic Rental Completion

A MySQL scheduled event automatically changes `Active → Completed` when the rental's end date has passed.

---

# 🚀 Local Setup

## 1. 📥 Clone the Repository

```bash
git clone <repository-url>
cd DBMS-Mini-Project
```

---

## 2. 📦 Install Backend Dependencies

Navigate to the backend directory:

```bash
cd backend
```

Install the required packages:

```bash
npm install
```

---

## 3. 🗄️ Set Up MySQL

Make sure MySQL Server is installed and running.

Create the project database in MySQL:

```sql
CREATE DATABASE vehicle_rental_db;
```

Then select it:

```sql
USE vehicle_rental_db;
```

Execute the SQL script containing:

* Table definitions
* Primary keys
* Foreign keys
* Unique constraints
* Database triggers
* Event Scheduler configuration

Also insert the required sample data.

> The database name and credentials should match the configuration used by `src/config/db.js`.

---

## 4. 🔐 Configure Database Connection

Update:

```text
backend/src/config/db.js
```

with your local MySQL configuration.

Example:

```js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "vehicle_rental_db"
});

module.exports = pool;
```

Do not commit actual database passwords to GitHub.

---

## 5. ▶️ Start the Backend

From the `backend` directory:

```bash
node src/server.js
```

If a development script is configured in `package.json`, you can also use:

```bash
npm start
```

The server should start on the configured port.

---

## 6. 🧪 Test the API

The endpoints can be tested using **Postman** or another API testing tool.

For example:

```http
GET http://localhost:5000/api/vehicles/available
```

For protected endpoints, include:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 📐 Project Documentation

The following database design diagrams are available under `images/`:

* `ER Diagram.png`
* `Relational Model.png`

These represent the database design used by the backend.
