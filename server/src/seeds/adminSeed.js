require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/database");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "volunteer3@festival.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    await User.create({
      name: "Volunteer 3",
      email: "volunteer3@festival.com",
      password: "12345678",
      role: "volunteer",
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
