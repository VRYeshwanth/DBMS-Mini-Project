# Vehicle Rental Management System (VRMS)

A full-stack DBMS mini-project for managing vehicle rentals, payments, maintenance, and branch operations. The database is designed around seven relational tables, with normalization to BCNF as a core project objective.

---

## Features

### Customer
- Browse vehicles and check availability.
- Book vehicles with pickup and return locations.
- Simulate payments using UPI, card, or cash.
- View booking confirmations, rental history, and profile details.

### Admin
- Manage vehicles, branches, rentals, customers, payments, and maintenance records.
- View dashboard metrics, branch revenue, vehicle utilization, and maintenance expenses.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express |
| Database | MySQL 8, MySQL2 |
| Authentication | JWT, bcrypt |

---

## Architecture

1. **React frontend** handles the customer and admin interfaces.
2. **Express REST API** processes requests and applies authentication and role-based access control.
3. **MySQL database** stores application data and enforces relational constraints.
4. **MySQL Event Scheduler** can automatically mark expired active rentals as completed.

---

## Database Design

The database contains seven tables:

| Table | Purpose |
|---|---|
| `USER_ACC` | Login credentials and user roles |
| `CUSTOMER` | Customer profile details |
| `BRANCH` | Pickup and return branches |
| `VEHICLE` | Vehicle details and assigned branch |
| `RENTAL` | Customer bookings and rental status |
| `PAYMENT` | Rental payment records |
| `MAINTENANCE` | Vehicle servicing records |

Key DBMS concepts demonstrated:
- BCNF normalization and functional dependencies.
- Primary keys, foreign keys, and referential integrity.
- Transactions for critical operations such as booking.
- Derived vehicle availability: a vehicle is unavailable if it has an active rental or active maintenance record.
- A scheduled MySQL event for completing expired rentals.

Database schema and seed data are in `database/schema.sql`. The ER diagram and relational model are in `images/`.

---

## Project Structure

```text
Directory structure:
└── DBMS-Mini-Project/
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
    │       ├── routes/
    │       │   ├── authRoutes.js
    │       │   ├── branchRoutes.js
    │       │   ├── customerRoutes.js
    │       │   ├── dashboardRoutes.js
    │       │   ├── maintenanceRoutes.js
    │       │   ├── paymentRoutes.js
    │       │   ├── rentalRoutes.js
    │       │   └── vehicleRoutes.js
    │       └── server.js
    ├── database/
    │   └── schema.sql
    ├── frontend/
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── public/
    │   │   └── car.svg
    │   ├── src/
    │   │   ├── App.css
    │   │   ├── App.jsx
    │   │   ├── assets/
    │   │   │   ├── hero.png
    │   │   │   ├── react.svg
    │   │   │   └── vite.svg
    │   │   ├── components/
    │   │   │   ├── common/
    │   │   │   │   ├── Alert.jsx
    │   │   │   │   ├── ConfirmDialog.jsx
    │   │   │   │   ├── EmptyState.jsx
    │   │   │   │   ├── LoadingSpinner.jsx
    │   │   │   │   ├── Modal.jsx
    │   │   │   │   ├── Navbar.jsx
    │   │   │   │   ├── ProtectedRoute.jsx
    │   │   │   │   ├── Sidebar.jsx
    │   │   │   │   ├── StatCard.jsx
    │   │   │   │   └── StatusBadge.jsx
    │   │   │   └── vehicles/
    │   │   │       └── VehicleCard.jsx
    │   │   ├── context/
    │   │   │   └── AuthContext.jsx
    │   │   ├── hooks/
    │   │   │   └── useAuth.js
    │   │   ├── index.css
    │   │   ├── layouts/
    │   │   │   ├── AdminLayout.jsx
    │   │   │   └── CustomerLayout.jsx
    │   │   ├── main.jsx
    │   │   ├── pages/
    │   │   │   ├── admin/
    │   │   │   │   ├── AdminDashboard.jsx
    │   │   │   │   ├── BranchManagement.jsx
    │   │   │   │   ├── CustomerManagement.jsx
    │   │   │   │   ├── MaintenanceManagement.jsx
    │   │   │   │   ├── PaymentManagement.jsx
    │   │   │   │   ├── RentalManagement.jsx
    │   │   │   │   └── VehicleManagement.jsx
    │   │   │   ├── auth/
    │   │   │   │   ├── Login.jsx
    │   │   │   │   └── Register.jsx
    │   │   │   ├── common/
    │   │   │   │   └── NotFound.jsx
    │   │   │   └── customer/
    │   │   │       ├── BookVehicle.jsx
    │   │   │       ├── BrowseVehicles.jsx
    │   │   │       ├── ConfirmationPage.jsx
    │   │   │       ├── CustomerDashboard.jsx
    │   │   │       ├── CustomerProfile.jsx
    │   │   │       ├── MyRentals.jsx
    │   │   │       ├── PaymentPage.jsx
    │   │   │       └── VehicleDetails.jsx
    │   │   ├── services/
    │   │   │   ├── api.js
    │   │   │   ├── authService.js
    │   │   │   ├── branchService.js
    │   │   │   ├── customerService.js
    │   │   │   ├── dashboardService.js
    │   │   │   ├── maintenanceService.js
    │   │   │   ├── paymentService.js
    │   │   │   ├── rentalService.js
    │   │   │   └── vehicleService.js
    │   │   └── utils/
    │   │       └── formatters.js
    │   └── vite.config.js
    ├── images/
    │   ├── Admin_Images/
    │   │   ├── Admin-Branches.png
    │   │   ├── Admin-Customers.png
    │   │   ├── Admin-Dashboard.png
    │   │   ├── Admin-Maintenance.png
    │   │   ├── Admin-Payments.png
    │   │   ├── Admin-Rentals.png
    │   │   └── Admin-Vehicles.png
    │   ├── Customer_Images/
    │   │   ├── Customer-Dashboard.png
    │   │   ├── Customer-Payment-Confirmation.png
    │   │   ├── Customer-Payment-Page.png
    │   │   ├── Customer-Profile.png
    │   │   ├── Customer-Rental-History.png
    │   │   ├── Customer-Rental-Page.png
    │   │   └── Customer-Vehicles.png
    │   ├── ER Diagram.png
    │   └── Relational Model.png
    └── README.md
```

---

## Setup

### Prerequisites
- Node.js 18 or later
- npm
- MySQL 8 or later
- Git

### 1. Clone the repository

```bash
git clone https://github.com/vryeshwanth/DBMS-Mini-Project.git
cd DBMS-Mini-Project
```

### 2. Set up the database

Start MySQL, then run:

```bash
mysql -u root -p < database/schema.sql
```

Alternatively, execute `database/schema.sql` in MySQL Workbench. The script creates the database and tables and inserts initial seed data.

### 3. Configure and start the backend

```bash
cd backend
npm install
```

Create a `.env` file. The expected variables are:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vehicle_rental_db
DB_PORT=3306
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=1d
```

Start the API:

```bash
npm run dev
```

If a development script is not available, use `npm start`.

Check the API at `http://localhost:5000/api/health`.

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. The project is configured to proxy `/api` requests to the backend on port `5000`; the configured frontend port is `3000`.

### 5. Test the application

1. Register a customer account and log in.
2. Browse vehicles, make a booking, and test the payment simulation.
3. To test the admin portal, update a registered user's role in MySQL:

```sql
USE vehicle_rental_db;
UPDATE USER_ACC
SET role = 'admin'
WHERE email = 'your_registered_email@example.com';
```

Log out and log back in.

---

## API Endpoints

All endpoints use the `/api` prefix. Protected endpoints require the following header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication and User Management

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a customer account | Public |
| `POST` | `/api/auth/login` | Log in and receive a JWT | Public |
| `GET` | `/api/auth/me` | Get the authenticated user's profile | Authenticated |
| `PUT` | `/api/auth/me` | Update the authenticated user's profile | Authenticated |

### Vehicles

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/vehicles` | List all vehicles | Public |
| `GET` | `/api/vehicles/available` | List available vehicles | Public |
| `GET` | `/api/vehicles/:plateNumber` | Get vehicle details | Public |
| `POST` | `/api/vehicles` | Add a vehicle | Admin |
| `PUT` | `/api/vehicles/:plateNumber` | Update vehicle details | Admin |
| `DELETE` | `/api/vehicles/:plateNumber` | Remove a vehicle | Admin |

### Rentals

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/rentals` | Book a vehicle | Customer |
| `GET` | `/api/rentals` | List rentals (customers see their own; admins see all) | Authenticated |
| `GET` | `/api/rentals/:rentalId` | Get details for a rental | Authenticated |

### Payments

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/payments` | Record a rental payment | Authenticated |
| `GET` | `/api/payments` | List payments (customers see their own; admins see all) | Authenticated |
| `GET` | `/api/payments/:paymentId` | Get payment details | Authenticated |

### Maintenance

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/maintenance` | Create a maintenance record | Admin |
| `GET` | `/api/maintenance` | List maintenance records | Admin |
| `GET` | `/api/maintenance/:maintenanceId` | Get a maintenance record | Admin |
| `PUT` | `/api/maintenance/:maintenanceId` | Update a maintenance record | Admin |
| `DELETE` | `/api/maintenance/:maintenanceId` | Delete a maintenance record | Admin |

### Branches

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/branches` | Create a branch | Admin |
| `GET` | `/api/branches` | List branches | Admin |
| `GET` | `/api/branches/:branchId` | Get branch details | Admin |
| `PUT` | `/api/branches/:branchId` | Update branch details | Admin |

### Customers

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/customers/me/rentals` | Get the authenticated customer's rental history | Customer |
| `GET` | `/api/customers` | List registered customers | Admin |
| `GET` | `/api/customers/:customerId` | Get a customer's profile and rental history | Admin |

### Dashboard and Analytics

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/dashboard` | Get summary metrics, revenue, vehicle utilization, and maintenance expenses | Admin |

### Health Check

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Check API server status | Public |

## Security and Business Rules

- Passwords are hashed with bcrypt; they are not stored as plaintext.
- JWT authentication and role-based access control protect restricted API routes.
- Booking logic checks vehicle availability and overlapping active rentals.
- Vehicles with active rentals cannot be placed into maintenance.
- Foreign key constraints protect related records from invalid deletion.
- Expired or invalid sessions are handled by the frontend API client.

---

## Screenshots

1. E-R Diagram
![E-R Diagram](./images/ER%20Diagram.png)

2. Relation Schema
![Relation Schema](./images/Relational%20Model.png)

Please refer to the website images under `images\Admin_Images` and `images\Customer_Images`

---
