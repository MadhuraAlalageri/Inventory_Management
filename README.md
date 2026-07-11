# Tool Inventory Management System

A full-stack web application designed to track tools, manage stock, and streamline the process of issuing tools to employees via Delivery Challans and Material Indents. 

## 🚀 Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Dockerized)
- **Other Services:** Nodemailer (Ethereal testing), Tesseract.js (OCR)

## ✨ Key Features
- **Role-Based Access Control (RBAC):** Separate dashboards and permissions for Managers (Admins) and standard Employees.
- **Inventory Tracking:** Real-time tracking of available and checked-out tools. Includes low-stock and out-of-stock alerts.
- **Request Workflows:** 
  - Employees can request tools by generating a **Delivery Challan** (external) or **Material Indent** (internal).
  - Managers can approve, reject, and export requests to Excel.
1- **Employee Management:** Managers can create new user accounts directly from the dashboard. The system automatically provisions a temporary password and generates a welcome email preview (via Ethereal). Employees can change their password securely on first login.
- **Automated Document Generation:** Instantly generate printable Delivery Challan invoices and Indents right from the browser.
- **Invoice OCR (Experimental):** Backend support for reading new stock invoices via Tesseract.js.

## 🛠️ Project Structure
- `/client` - React frontend application.
- `/server` - Node.js Express backend and API routes.

## 💻 Getting Started

### 1. Database (PostgreSQL)
The application relies on a Dockerized PostgreSQL container (`inventory_postgres`) running on port `5432`.
```bash
# Start the database container
docker start inventory_postgres
```
*(Note: The container is configured to restart automatically unless explicitly stopped).*

### 2. Backend Server
The backend API runs on port `5003`.
```bash
cd server
npm install
node server.js
```

### 3. Frontend Client
The frontend runs using Vite, typically on port `5173`.
```bash
cd client
npm install
npm run dev
```

## 🔐 Default Test Credentials
- **Admin / Manager:** `admin1@gmail.com` | `123456`
- **Standard Employee:** `armtronixiot@gmail.com` | `123456`

## 📧 Email Testing
Automated emails (like New User creation) are handled via [Ethereal Email](https://ethereal.email). Instead of spamming real inboxes, the Node.js backend prints a unique "Preview URL" to the server terminal. Click the link in the terminal to view the rendered email.
