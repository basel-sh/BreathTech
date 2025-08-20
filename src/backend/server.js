import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // allow large audio
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ MongoDB connection
const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Schema & Model
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  sex: { type: String, required: true },
  weight: Number,
  height: Number,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 BreathTech Backend is Running!");
});

// ✅ Register new user
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, age, sex, weight, height, email, password } = req.body;

    if (!fullName || !age || !sex || !email || !password) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const newUser = new User({
      fullName,
      age,
      sex,
      weight,
      height,
      email,
      password,
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

// ✅ Login user
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

// ✅ Update user profile
app.put("/api/update-profile", async (req, res) => {
  try {
    const { email, fullName, age, weight, height, conditions } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { fullName, age, weight, height, conditions },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...userData } = user.toObject();
    res.json({ user: userData });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete account
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

const upload = multer(); // store file in memory

// ✅ AI Prediction Proxy (with file upload)
app.post("/api/predict", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    // Extract fields from form-data
    const {
      Age,
      BMI,
      Is_Adult,
      Has_Crackles,
      Has_Wheezes,
      SBP,
      DBP,
      HR,
      SpO2,
      Sex_M,
      Chest_Location_Al,
      Chest_Location_Ar,
      Chest_Location_Pl,
      Chest_Location_Pr,
      Chest_Location_Ll,
      Chest_Location_Lr,
    } = req.body;

    // Prepare form-data to forward to AI backend
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append("Age", Age);
    form.append("BMI", BMI);
    form.append("Is_Adult", Is_Adult);
    form.append("Has_Crackles", Has_Crackles);
    form.append("Has_Wheezes", Has_Wheezes);
    form.append("SBP", SBP);
    form.append("DBP", DBP);
    form.append("HR", HR);
    form.append("SpO2", SpO2);
    form.append("Sex_M", Sex_M);
    form.append("Chest_Location_Al", Chest_Location_Al);
    form.append("Chest_Location_Ar", Chest_Location_Ar);
    form.append("Chest_Location_Pl", Chest_Location_Pl);
    form.append("Chest_Location_Pr", Chest_Location_Pr);
    form.append("Chest_Location_Ll", Chest_Location_Ll);
    form.append("Chest_Location_Lr", Chest_Location_Lr);

    // Forward to AI backend
    const response = await fetch(
      "https://pulmonary-aimodelbackend-host-production.up.railway.app/predict",
      { method: "POST", body: form }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Prediction proxy error:", err);
    res.status(500).json({
      message: "Prediction failed",
      error: err.toString(),
    });
  }
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
