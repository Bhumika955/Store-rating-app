
# RateHub - Full-Stack Store Rating & Management System

RateHub is a full-stack, role-based store rating and management platform built using React.js, Node.js, Express.js and PostgreSQL. It provides a secure environment for System Administrators, Store Owners and Normal Users to manage stores, submit ratings and monitor customer feedback.

## 🌐 Live Deployment Links

- **Frontend Application (Vercel):** [https://store-rating-app-delta-roan.vercel.app](https://store-rating-app-delta-roan.vercel.app)
- **Backend API Service (Render):** [https://store-rating-backend-t56v.onrender.com](https://store-rating-backend-t56v.onrender.com)
- **Database:** Serverless PostgreSQL on Neon

---

## Features

### 1. System Administrator (ADMIN)

- Dashboard with total users, stores and ratings statistics.
- Add and manage users with different roles.
- Register new stores with name, email and address.
- Search users and stores by name, email or address.
- Filter users by role: ADMIN, STORE_OWNER and USER.
- Sort table columns in ascending or descending order.
- View average store ratings and store owner details.

### 2. Store Owner (STORE_OWNER)

- Dedicated dashboard for assigned store details.
- View the store's average rating.
- View customer feedback, including customer names, emails and ratings.
- Change account password securely.

### 3. Normal User (USER)

- Browse all registered stores with addresses and average ratings.
- Search stores by name or address.
- Sort stores alphabetically.
- Submit ratings from 1 to 5 stars.
- Update previously submitted ratings.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Axios |
| Routing | React Router v6 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Neon Serverless |
| Database Driver | pg |
| Authentication | JWT |
| Password Security | bcryptjs |
| Validation | express-validator |

## Project Structure

```text
store-rating-system/
├── backend/
│   ├── db.js
│   ├── middleware.js
│   ├── server.js
│   ├── schema.sql
│   ├── seed.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── OwnerDashboard.js
│   │   │   ├── UserDashboard.js
│   │   │   ├── Login.js
│   │   │   └── Signup.js
│   │   ├── api.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

Follow these steps to run RateHub locally.

### Prerequisites

Make sure you have the following installed:

- Node.js (v16 or higher)
- npm
- Git
- PostgreSQL or a Neon PostgreSQL database

### 1. Clone the Repository

```bash
git clone https://github.com/Bhumika955/Store-rating-app

cd store-rating-app
```

### 2. Database Setup

1. Create a PostgreSQL database or a free Neon database.
2. Open the Neon SQL Editor or your PostgreSQL client.
3. Execute the SQL statements from `backend/schema.sql`.

This will create the required database tables:

- users
- stores
- ratings

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000

DATABASE_URL=postgresql://<user>:<password>@<neon-endpoint>/neondb?sslmode=require

JWT_SECRET=your_super_secret_jwt_key
```

Replace the database credentials and JWT secret with your own values.


#### Seed Demo Data

Run the following command to create the initial demo accounts:

```bash
node seed.js
```

#### Start the Backend Server

```bash
npm run dev
```

Alternatively:

```bash
node server.js
```

The backend server will run at:

http://localhost:5000

### 4. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will open at:

http://localhost:3000

## Demo Credentials

Use the following credentials after running the database seed script.

| Role | Email | Password |
|---|---|---|
| System Administrator | admin@test.com | Admin@12345 |
| Store Owner | owner@test.com | Owner@12345 |
| Normal User | Register via Signup | User-defined |

**Note:** Demo credentials are intended for local development and testing only. Do not use default credentials in production.

## Validation & Security

RateHub implements server-side validation and authentication to protect user data and enforce role-based access.

| Field | Validation Rules |
|---|---|
| Name | Minimum 20 characters, maximum 60 characters |
| Address | Maximum 400 characters |
| Password | 8–16 characters, at least one uppercase letter and one special character |
| Rating | Integer value between 1 and 5 |
| Authentication | JWT-based authentication |
| Password Storage | Hashed using bcryptjs |

Additional security features:

- Role-based access control for Admin, Store Owner and Normal User.
- Protected routes and API endpoints.
- JWT authentication middleware.
- Automatic bearer token attachment through Axios interceptors.
- Input validation using express-validator.

## Application Workflow

1. Users log in or register through the authentication interface.
2. The system identifies the user's role and provides access to the relevant dashboard.
3. Administrators manage users, stores and platform data.
4. Normal users browse stores and submit or update ratings.
5. Store owners monitor average ratings and customer feedback.

## Future Enhancements

- Pagination for large datasets.
- Advanced analytics and rating visualizations.
- Email verification and password reset functionality.
- Automated testing for frontend and backend APIs.
- Production deployment with environment-specific configurations.

## Author

**Bhumika Banke**

- GitHub: [Bhumika955](https://github.com/Bhumika955)

---

Built with React.js, Node.js, Express.js and PostgreSQL.