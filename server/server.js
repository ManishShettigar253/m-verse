// server/server.js
const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during testing
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
const llmRoutes = require("./routes/llmRoutes");
app.use("/api/llm", llmRoutes);

// Health check / root
app.get("/api", (req, res) => {
  res.json({ status: "ok", service: "mVerse Intelligence API", version: "2.0" });
});

// Server start (local development)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
