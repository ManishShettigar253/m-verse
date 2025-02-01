// server/server.js
const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
app.use(cors({
  origin : ["https://mverse-manish.vercel.app/"],
  methods : ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

// Routes
const llmRoutes = require("./routes/llmRoutes");
app.use("/api/llm", llmRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
