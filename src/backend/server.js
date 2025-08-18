import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
const uri =
  "mongodb+srv://baselshm:eWgCsSbduFbNyoZ6@breathtech.qwnthgj.mongodb.net/WebsiteAccounts?retryWrites=true&w=majority&appName=BreathTech";

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

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

// ✅ API Routes

// Register new user
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, age, sex, weight, height, email, password } = req.body;

    if (!fullName || !age || !sex || !email || !password) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    // Prevent duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

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

// Get all users (for testing)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login user

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ Send consistent format
    const { password: pw, ...userData } = user.toObject();
    res.json({ user: userData }); // <<< FIXED (wrap in user)
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update user profile
app.put("/api/update-profile", async (req, res) => {
  try {
    const { email, fullName, age, weight, height, conditions } = req.body;

    // Find and update user by email
    const user = await User.findOneAndUpdate(
      { email }, // search by email
      { fullName, age, weight, height, conditions }, // update fields
      { new: true } // return the updated document
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // remove password before sending
    const { password, ...userData } = user.toObject();

    res.json({ user: userData });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE Account
app.delete("/api/delete-account", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting account:", err);
    res.status(500).json({ message: "Server error while deleting account" });
  }
});

// ✅ Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
