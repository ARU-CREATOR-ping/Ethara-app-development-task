# Ethara – Team Task Manager

A project management web app I built for managing teams and tracking project progress. It has a Kanban-style board where you can drag projects between stages, assign members, and upload files.

## What I Built

- **Login / Signup** with JWT tokens, roles (Admin and Member)
- **Admin can** create projects, assign team members, edit or delete projects, mark tasks urgent, and approve completed work
- **Members can** view assigned projects, move them across stages, and upload files
- **5-stage Kanban board** – To Do → In Progress → Quality Assurance → Completed → Accepted
- **Drag and Drop** – just grab a card and drop it into the next column
- **Mark Urgent** – flag any project with a red urgent badge
- **File Attachments** – upload docs, images, or PDFs directly to a project
- **Forgot Password** – reset your password from the login screen
- **Dashboard** with stats and recent activity

## Tech Stack

- Frontend: React + Vite, Vanilla CSS
- Backend: Node.js, Express
- Database: MongoDB (Atlas)
- Auth: JWT

## How to Run Locally

**1. Install packages**
```
cd client
npm install

cd ../server
npm install
```

**2. Create a `.env` file inside the `server` folder**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

**3. Start the backend**
```
cd server
node server.js
```

**4. Start the frontend** (open a new terminal)
```
cd client
npm run dev
```

App will open at `http://localhost:5173`
