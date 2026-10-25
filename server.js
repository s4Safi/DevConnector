import 'dotenv/config';
import express from "express";
import connectDB from "./db/db.js";

import authRoutes from "./routes/api/auth.routes.js";
import userRoutes from "./routes/api/user.routes.js";
import profileRoutes from "./routes/api/profile.routes.js";
import postRoutes from "./routes/api/posts.routes.js";

const app = express();

connectDB();

// Built-in body parser
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ errors: [{ msg: "Server error" }] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
