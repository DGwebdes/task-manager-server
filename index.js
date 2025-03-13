const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db/db");
const taskRouter = require("./routes/taskRoutes");
const authRouter = require("./routes/authRoutes");

const PORT = process.env.PORT || 3000;
const app = express();

// Trust the first proxy
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());
//Connecting to DB
connectDB();
//Routers
app.use("/tasks", taskRouter);
app.use("/auth", authRouter);

//initialize server
app.listen(PORT, () => {
    console.log(`App listening on port :${PORT}`);
});
