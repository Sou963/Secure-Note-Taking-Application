const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

const app = express();

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// API Routes
// --------------------------------------------------

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/posts"));

// --------------------------------------------------
// Frontend - Local development only
// --------------------------------------------------

if (!process.env.VERCEL) {
  const frontendPath = path.join(__dirname, "../frontend");

  app.use(express.static(frontendPath));

  app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Secure Note App API running",
  });
});

// --------------------------------------------------
// Vercel root response
// --------------------------------------------------

if (process.env.VERCEL) {
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "ok",
      message: "Secure Note App API running",
    });
  });
}

// --------------------------------------------------
// 404 Handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// --------------------------------------------------
// MongoDB Connection
// --------------------------------------------------

connectDB().catch((error) => {
  console.error("MongoDB connection failed:", error.message);
});

// --------------------------------------------------
// Local Server
// --------------------------------------------------

// if (require.main === module) {
//   const PORT = process.env.PORT || 5000;

//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// }

// --------------------------------------------------
// Export for Vercel
// --------------------------------------------------

module.exports = app;
