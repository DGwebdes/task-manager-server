# Backend Documentation

## Project Overview
This is the **backend** of a Task Management application, implemented with **Node.js** and **Express.js**. It provides RESTful APIs for managing tasks, including user authentication and task CRUD operations.

---

## Setup Instructions

### Prerequisites
- Node.js installed on your machine
- MongoDB instance running (local or cloud-based)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables by creating a `.env` file:
   ```plaintext
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_secret_key
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000`.

---

## Folder Structure
```
backend/
├── controllers/        # Business logic for handling API requests
├── models/             # Mongoose schemas and models
├── middleware/         # Custom middleware (e.g., auth)
├── routes/             # API route definitions
├── utils/              # Utility functions (e.g., error handling)
├── .env                # Environment variables
├── app.js              # Main application file
└── package.json        # Project dependencies and scripts
```

---

## Key Features

### 1. **Authentication**
- **JWT-Based Authentication**: Users log in with credentials, and tokens are issued for secure API interactions.
- **Middleware**: Protects private routes by validating JWT tokens.

### 2. **Task Management**
- **Task CRUD**: Endpoints for creating, reading, updating, and deleting tasks.
- **Filtering**: Query tasks based on priority, completion status, and due date.

### 3. **Error Handling**
- Centralized error handler sends user-friendly messages and appropriate HTTP status codes.
- Handles validation errors, authentication failures, and missing resources.

### 4. **Security**
- Input validation with **Joi** to prevent malformed requests.
- Secure password storage using **bcrypt**.

---

## API Endpoints

### Authentication
| Endpoint       | Method | Description               |
|----------------|--------|---------------------------|
| `/register`    | POST   | Register a new user       |
| `/login`       | POST   | Log in a user             |

### Tasks
| Endpoint              | Method | Description                    |
|-----------------------|--------|--------------------------------|
| `/tasks`              | GET    | Fetch all tasks (filterable)   |
| `/tasks`              | POST   | Create a new task              |
| `/tasks/:id`          | PUT    | Update an existing task        |
| `/tasks/:id`          | DELETE | Delete a task                  |
| `/tasks/:id/status`   | PATCH  | Toggle task completion status  |

---

## Middlewares

### Authentication Middleware
Ensures that endpoints are protected and accessible only to authenticated users:
```javascript
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
```

---

## Testing
- Use **Postman** or **Swagger** to test endpoints.
- Ensure database (MongoDB) is running before testing.

---

## Future Improvements
- Implement role-based access control (e.g., admin vs. user).
- Add task history for tracking changes.
- Enable task reminders using a scheduling library like **node-schedule**.
