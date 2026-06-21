# CityFix - Real-Time Smart Civic Complaint & Issue Tracking System

CityFix is a full-stack civic issue management platform built using the MERN stack, designed for seamless reporting and resolution of city complaints with role-based access for Citizens, Officers, and Admins.

The platform includes secure JWT authentication, real-time Socket.IO notifications, geo-tagged complaint submission, governed status workflows, admin analytics, and fully responsive dashboards for modern civic operations.

Cloudinary is integrated as an optional backend feature. When configured, CityFix uploads complaint images to Cloudinary. When it is not configured, the app continues to work with in-app notifications and complaints saved without images, so current deployments run without changes.

---

## Features

- JWT authentication with role-based access control
- Citizen, Officer, and Admin dashboards
- Real-time notifications via Socket.IO
- Geo-location map picker for complaint reporting
- Governed complaint lifecycle workflow
- Admin complaint assignment and user management
- Officer progress updates on assigned issues only
- Cloudinary media uploads
- Admin analytics dashboard
- Complaint audit trail and status history
- Redux Toolkit global state management
- Responsive UI with Tailwind CSS

---

## Tech Stack

### Frontend

- React.js
- Vite
- Redux Toolkit
- Tailwind CSS
- React Router DOM
- Axios
- Leaflet / React Leaflet
- Socket.IO Client

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Socket.IO

### Services and Integrations

- MongoDB Atlas
- Cloudinary

---

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/CityFIX.git
```

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Root scripts (optional)

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

### Create first admin (local)

1. Register at `/register` (creates a citizen account).
2. Open MongoDB Atlas → `users` collection → set `role` to `"admin"`.
3. Log out and log back in.
4. Promote officers from **Admin → User Management**.

---

## Environment Variables

### `/backend/.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
CLIENT_ORIGIN=http://localhost:5173

# Optional media uploads.
# If omitted, complaints are created without images.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### `/frontend/.env.local`

```env
VITE_API_ORIGIN=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Real-Time Notifications

CityFix uses Socket.IO on the backend for live updates. Connections are authenticated with the same JWT used for REST API requests.

- Citizen: notified when complaint status changes
- Officer: notified when a complaint is assigned
- Admin: dashboard and complaint list refresh on new submissions and updates

Behavior with Socket.IO configured: notifications appear instantly in the bell icon and relevant lists refresh automatically.

Behavior without a running backend socket connection: the app falls back to REST API polling on page load and manual refresh.

---

## Complaint Workflow

```
Pending → Assigned → In Progress → Resolved
   ↓         ↓            ↓
Rejected  Rejected     Rejected (Admin)
```

- **Citizens** submit complaints and track their own issues.
- **Admins** assign officers, reject invalid complaints, and may force-resolve escalations.
- **Officers** update only complaints assigned to them.
- **Resolved** and **Rejected** are terminal states.

---

## API Reference

Base URL:

```bash
http://localhost:{PORT}/api
```

### Authentication Routes - `/api/auth`

| Method | Endpoint    | Auth | Description              |
| ------ | ----------- | ---- | ------------------------ |
| POST   | `/register` | No   | Register citizen account |
| POST   | `/login`    | No   | Login user               |
| GET    | `/me`       | Yes  | Get current user         |

### Complaint Routes - `/api/complaints`

| Method | Endpoint        | Auth | Role              | Description                    |
| ------ | --------------- | ---- | ----------------- | ------------------------------ |
| POST   | `/`             | Yes  | Citizen           | Submit complaint               |
| GET    | `/mine`         | Yes  | Citizen           | Get own complaints             |
| GET    | `/assigned`     | Yes  | Officer           | Get assigned complaints        |
| GET    | `/`             | Yes  | Admin             | List all complaints            |
| GET    | `/:id`          | Yes  | Citizen/Officer/Admin | Get complaint by ID        |
| PATCH  | `/:id/status`   | Yes  | Officer/Admin     | Update complaint status        |

### Admin Routes - `/api/admin`

| Method | Endpoint                  | Auth | Description              |
| ------ | ------------------------- | ---- | ------------------------ |
| PATCH  | `/complaints/:id/assign`  | Yes  | Assign or unassign officer |
| GET    | `/users`                  | Yes  | List all users           |
| PATCH  | `/users/:id/role`         | Yes  | Update user role         |
| GET    | `/analytics`              | Yes  | Get dashboard analytics  |

### Notification Routes - `/api/notifications`

| Method | Endpoint    | Auth | Description              |
| ------ | ----------- | ---- | ------------------------ |
| GET    | `/`         | Yes  | List user notifications  |
| PATCH  | `/:id/read` | Yes  | Mark notification as read |

### Health Check

| Method | Endpoint     | Auth | Description    |
| ------ | ------------ | ---- | -------------- |
| GET    | `/api/health` | No  | API health status |

---

## Role Permissions

| Action                    | Citizen | Officer | Admin |
| ------------------------- | ------- | ------- | ----- |
| Register (public)         | Yes     | No      | No    |
| Submit complaint          | Yes     | No      | No    |
| View own complaints       | Yes     | No      | No    |
| View assigned complaints  | No      | Yes     | No    |
| Update progress           | No      | Yes     | Yes   |
| Assign / unassign officer | No      | No      | Yes   |
| Reject complaint          | No      | No      | Yes   |
| User & analytics dashboard| No      | No      | Yes   |

---

## Future Enhancements

- Department-based officer routing
- SLA timers and escalation alerts
- SMS notifications
- Complaint heatmap by ward/zone
- PDF export for audit reports
- Multi-language support
- Mobile app (React Native)

---

## Author

GitHub: https://github.com/YOUR_USERNAME

LinkedIn: https://www.linkedin.com/in/YOUR_PROFILE
