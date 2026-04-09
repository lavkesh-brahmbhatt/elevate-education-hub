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

## 📂 Production Deployment

### 1. Build for Production
Compiles the frontend into high-performance static assets:
```bash
npm run build
```

### 2. Configure Environment
Ensure `backend/.env` has a production-ready `MONGO_URI` (e.g., MongoDB Atlas).

### 3. Start Unified Server
The backend now serves the frontend assets from the `dist/` folder:
```bash
npm start
```
The app will now be hosted entirely on your specified `PORT` (default 5000).

---

## 🛠️ Security & Scaling
- **Static Asset Serving:** Express is configured to serve the `dist` folder automatically.
- **Graceful Error Handling:** Production ready 404 and 500 catch-all routes.
- **Security Headers:** Integrated `helmet` with customized CSP for multi-tenant assets.
- **Node Environment:** Optimized for low-latency with `0.0.0.0` binding.

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
