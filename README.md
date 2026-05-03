# Team Task Manager

A full-stack project and task management application designed with a premium, dynamic UI.

## Features
- **Authentication**: Secure JWT-based Signup/Login.
- **Role-Based Access**: 
  - **Admin**: Create projects, add tasks, delete content, and update anything.
  - **Member**: View projects/tasks and update task statuses.
- **Dashboard**: High-level overview with task statistics and recent activity.
- **Project & Task Management**: Kanban-style project boards to track To Do, In Progress, and Done tasks.

## Technology Stack
- **Frontend**: React (Vite), React Router, Vanilla CSS (Premium styling).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB & Mongoose.

## Running Locally

1. **Install Dependencies**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
   JWT_SECRET=super_secret_jwt_key_for_task_manager
   ```

3. **Start the Development Servers**
   In one terminal (Backend):
   ```bash
   cd server
   node server.js
   ```
   In another terminal (Frontend):
   ```bash
   cd client
   npm run dev
   ```

## Deployment to Railway

This repository is pre-configured for a seamless deployment on Railway using a monorepo setup.

1. Push this code to a GitHub repository.
2. Go to [Railway](https://railway.app/) and create a new project.
3. Choose **Deploy from GitHub repo** and select your repository.
4. Add a **MongoDB plugin** to your Railway project.
5. In your Railway service settings, add the following environment variables:
   - `MONGO_URI`: The connection URL from the Railway MongoDB plugin.
   - `JWT_SECRET`: A strong random string for JWT signing.
6. Railway will automatically detect the `railway.json` and build both the frontend and backend, serving the entire application from a single service!

## Demo Video
(Link to demo video will go here)
