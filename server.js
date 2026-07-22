import 'dotenv/config';
import express from "express";
import connectDB from "./db/db.js";
import auth from "./routes/api/auth.js";
import user from "./routes/api/user.routes.js";
import profile from "./routes/api/profile.routes.js";
import post from "./routes/api/posts.routes.js";

const app = express();
connectDB();

const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
    res.send("API is running");
})

// Initialize Middleware
app.use(express.json({ extended: false }))

// Define Routes
app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/profile", profile);
app.use("/api/posts", post);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})