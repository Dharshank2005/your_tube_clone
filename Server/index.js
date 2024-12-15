import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import videoroutes from './Routes/video.js';
import userroutes from "./Routes/User.js";
import path from 'path';
import commentroutes from './Routes/comment.js';
import groupRoutes from './Routes/group.js'; // Import group routes
import inviteRoutes from './Routes/inviteRoutes.js'; // Import invite routes

dotenv.config();
const app = express();

app.use(cors())
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use('/uploads', express.static(path.join('uploads')));

app.get('/', (req, res) => {
    res.send("Your tube is working");
});

app.use(bodyParser.json());
app.use('/user', userroutes);
app.use('/video', videoroutes);
app.use('/comment', commentroutes);
app.use('/group', groupRoutes); // Integrating group routes here
app.use('/invite', inviteRoutes); // Adding the invite route for email invitations

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});

const DB_URL = process.env.DB_URL;

// Ensure the DB_URL is properly configured
if (!DB_URL) {
    console.error("DB_URL not found in environment variables.");
    process.exit(1); // Exit if DB_URL is not found
}

mongoose.connect(DB_URL)
    .then(() => {
        console.log("MongoDB Database connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
        process.exit(1); // Exit the process if MongoDB connection fails
    });