# Academy OS - Multi-Tenant School Management System

A high-performance, scalable School Management System built on the MERN stack with strict multi-tenant data isolation. Each school operates in its own logical space using a unified infrastructure.

## 🚀 Features

- **Multi-Tenant Architecture:** Complete data isolation between different schools.
- **Role-Based Access Control (RBAC):** Secure modules for Admins, Teachers, and Students.
- **Dynamic Dashboard:** Real-time statistics and analytics for school performance.
- **Module Management:** Dedicated management for Teachers, Students, Classes, and Subjects.
- **Secure Authentication:** JWT-based sessions with hashed passwords (bcryptjs).
- **Responsive UI:** Modern, child-friendly design built with React, Tailwind, and Shadcn UI.

---

## 🏫 Demo Credentials

Use these credentials to test the system's isolation. All data is scoped specifically to each tenant.
**Password for all accounts:** `password123`

### **Tenant A: Green Valley Public School**
*Subdomain / Tenant ID:* `tenantA`

| Role | Email Address |
| :--- | :--- |
| **Admin** | `admin@tenantA.com` |
| **Teacher** | `rajesh@schoolA.com` |
| **Student** | `arjun@gv.com` |

### **Tenant B: Shree Saraswati Vidyalaya**
*Subdomain / Tenant ID:* `tenantB`

| Role | Email Address |
| :--- | :--- |
| **Admin** | `admin@tenantB.com` |
| **Teacher** | `mahesh@schoolB.com` |
| **Student** | `dhruv@sv.com` |

> **Note:** Use the **Tenant ID** (e.g., `tenantA`) correctly in the login page or subdomain testing.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Running locally on port 27017)

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/school-management
JWT_SECRET=your_jwt_secret
```

### 4. Database Seeding
Populate the database with the demo tenants and users:
```bash
node seed.js
```

### 5. Start the Application

**Run Backend:**
```bash
cd backend
node server.js
```

**Run Frontend:**
```bash
npm install
npm run dev
```

The application will be available at `http://localhost:8080`.

---

## 📝 Technologies Used
- **Frontend:** React, Vite, TailwindCSS, Shadcn UI, Recharts, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Security:** JWT, BcryptJS

---

## 📂 Project Structure
- `/src`: Frontend React components and pages.
- `/backend`: Node.js server, middlewares, and MongoDB models.
- `/backend/seed.js`: The central data seeder for demo environments.
