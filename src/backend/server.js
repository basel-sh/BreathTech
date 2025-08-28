import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken"; // ✅ NEW
import bcrypt from "bcrypt"; // ✅ For password hashing

const upload = multer();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // ⚠️ set in .env

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

// Middleware to verify token
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// Register new user
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

    const hashedPassword = await bcrypt.hash(password, 10);
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
      password: hashedPassword,
      role,
      avatar,
    });
    await newUser.save();

    // ✅ Create token immediately after signup
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: pw, ...userData } = newUser.toObject();

    res.status(201).json({
      message: "User registered successfully!",
      token, // 🔑 return token to frontend
      user: userData,
    });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" }); // ✅ create token

    const { password: pw, ...userData } = user.toObject();
    res.json({ token, user: userData }); // ✅ send token to frontend
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile (with token)
app.put(
  "/api/update-profile",
  authenticate,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      const { fullName, age, weight, height, conditions, avatar } = req.body;
      const updateData = { fullName, age, weight, height, conditions };

      if (req.file) {
        updateData.avatar = "/uploads/" + req.file.filename;
      } else if (avatar === "") {
        updateData.avatar = "/default-avatar.png";
      }

      const user = await User.findByIdAndUpdate(req.userId, updateData, {
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

// Delete account (with token)
app.delete("/api/delete-account", authenticate, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.userId);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting account:", err);
    res.status(500).json({ message: "Server error while deleting account" });
  }
});

// Get logged-in user profile
app.get("/api/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Old AI model (breath/audio)
app.post("/api/predict", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Ensure all required fields are sent as strings
    const requiredFields = [
      "Age",
      "BMI",
      "Is_Adult",
      "Has_Crackles",
      "Has_Wheezes",
      "SBP",
      "DBP",
      "HR",
      "SpO2",
      "Sex_M",
      "Chest_Location_Al",
      "Chest_Location_Ar",
      "Chest_Location_Pl",
      "Chest_Location_Pr",
      "Chest_Location_Ll",
      "Chest_Location_Lr",
    ];

    requiredFields.forEach((key) => {
      if (!(key in req.body)) {
        throw new Error(`Missing field: ${key}`);
      }
      form.append(key, req.body[key].toString());
    });

    const response = await fetch(
      "https://breathtech-ai-models-hoting-production.up.railway.app/predict",
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

// New AI model (skin diagnosis)
app.post("/api/skin-diagnose", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No image file uploaded" });

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await fetch(
      "https://breathtech-ai-models-hoting-production.up.railway.app/diagnose",
      { method: "POST", body: form }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Skin model proxy error:", err);
    res
      .status(500)
      .json({ message: "Skin diagnosis failed", error: err.toString() });
  }
});
// ======================================================
// ===================== AI PROXIES =====================
// (unchanged)
// ======================================================

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
