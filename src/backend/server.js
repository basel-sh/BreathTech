import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const uploadAvatar = multer({ storage });

// Serve uploaded avatars
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  sex: { type: String, required: true },
  weight: Number,
  height: Number,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor"], required: true },
  avatar: { type: String, default: "/default-avatar.png" },
});

const User = mongoose.model("User", userSchema);

// Root route
app.get("/", (req, res) => res.send("🚀 BreathTech Backend is Running!"));

// Register new user with optional avatar
app.post("/api/register", uploadAvatar.single("avatar"), async (req, res) => {
  try {
    const { fullName, age, sex, weight, height, email, password, role } =
      req.body;
    if (!fullName || !age || !sex || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    if (await User.findOne({ email }))
      return res.status(400).json({ error: "Email already registered" });

    const avatar = req.file
      ? "/uploads/" + req.file.filename
      : "/default-avatar.png";

    const newUser = new User({
      fullName,
      age,
      sex,
      weight,
      height,
      email,
      password,
      role,
      avatar,
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully!", user: newUser });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });
    if (user.password !== password)
      return res.status(400).json({ message: "Invalid password" });

    const { password: pw, ...userData } = user.toObject();
    res.json({ user: userData });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile with optional avatar or delete avatar
app.put(
  "/api/update-profile",
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      const { email, fullName, age, weight, height, conditions, avatar } =
        req.body;
      const updateData = { fullName, age, weight, height, conditions };

      if (req.file) {
        // New avatar uploaded
        updateData.avatar = "/uploads/" + req.file.filename;
      } else if (avatar === "") {
        // Delete avatar: set back to default
        updateData.avatar = "/default-avatar.png";
      }

      const user = await User.findOneAndUpdate({ email }, updateData, {
        new: true,
      });
      if (!user) return res.status(404).json({ message: "User not found" });

      const { password, ...userData } = user.toObject();
      res.json({ user: userData });
    } catch (err) {
      console.error("❌ Update error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete account
app.delete("/api/delete-account", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const deletedUser = await User.findOneAndDelete({ email });
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting account:", err);
    res.status(500).json({ message: "Server error while deleting account" });
  }
});

// AI Prediction Proxy
const upload = multer();
app.post("/api/predict", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // forward all other fields
    Object.keys(req.body).forEach((key) => form.append(key, req.body[key]));

    const response = await fetch(
      "https://pulmonary-aimodelbackend-host-production.up.railway.app/predict",
      { method: "POST", body: form }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Prediction proxy error:", err);
    res
      .status(500)
      .json({ message: "Prediction failed", error: err.toString() });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
