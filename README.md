# StockKeeper - Inventory Management System

StockKeeper is a production-ready, full-stack inventory management platform built with a high-performance **NestJS** backend, a dynamic **Next.js 15** frontend using the **App Router**, **MongoDB Mongoose** schemas, and an interactive **Recharts** dashboard.

---

## Technical Stack Overview

- **Backend**: NestJS, TypeScript, MongoDB (Mongoose), JWT Authentication, Passport.js, Swagger.
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Lucide Icons, React Hook Form, Zod Validation, Recharts, Zustand state management.
- **Reports Engines**: `exceljs` for Excel downloads, `pdfkit` for styled PDF summary logs.

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **NPM**: `v9.x` or higher
- **MongoDB**: Local MongoDB community server (running on default port `27017`) or a MongoDB Atlas URI string.

---

### Step 1: Database & Backend Configuration

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. The project dependencies are already initialized. If needed, install them:
   ```bash
   npm install
   ```

3. Create the local configuration `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Configure the environment variables inside `.env`:
   - `PORT`: Server port (default: `3001` to avoid conflicting with Next.js).
   - `MONGODB_URI`: Mongoose connection string (e.g. `mongodb://localhost:27017/inventory`).
   - `JWT_SECRET`: Random string for access tokens.
   - `JWT_REFRESH_SECRET`: Random string for refresh tokens.

---

### Step 2: Running the Backend Server

Start the NestJS server in development watch mode:
```bash
npm run start:dev
```
The server will run on [http://localhost:3001](http://localhost:3001).

- **Seeding Users**: On first launch, if the database is empty, the server automatically seeds default admin and staff credentials.
- **API Documentation**: Interactive Swagger docs will be generated automatically at [http://localhost:3001/api/docs](http://localhost:3001/api/docs).

---

### Step 3: Frontend Configuration

1. Open a second terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. If needed, install the client dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Create the local configuration `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Verify that `NEXT_PUBLIC_API_URL` points to your backend instance:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

---

### Step 4: Running the Frontend Client

Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Quick Access Seed Accounts

Use these pre-loaded accounts to log in immediately upon initial start:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@inventory.com` | `Admin@123456` |
| **Staff** | `staff@inventory.com` | `Staff@123456` |

---

## Role-Based Permissions Checklist

- **Admin Role**:
  - Full Access to view the Dashboard and charts.
  - Full CRUD on the Product catalog (Create, View, Edit, Delete).
  - Perform Stock In / Stock Out operations.
  - View full Stock history transaction log.
  - Export Products and History reports to Excel/PDF.

- **Staff Role**:
  - Access to view the Dashboard and charts.
  - View the Product catalog and detailed specifications.
  - Perform Stock In / Stock Out operations.
  - View full Stock history transaction log.
  - Export Products and History reports to Excel/PDF.
  - *Restricted from Creating, Editing, or Deleting products in the catalog.*

---

## Production Deployment Checklist

### Backend Build
1. Build the compilation files:
   ```bash
   npm run build
   ```
2. Run the production bundle:
   ```bash
   npm run start:prod
   ```

### Frontend Build
1. Build the production application bundle:
   ```bash
   npm run build
   ```
2. Start the optimized server:
   ```bash
   npm run start
   ```
