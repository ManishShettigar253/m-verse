// server/routes/llmRoutes.js
const express = require("express");
const router = express.Router();
const { getLLMResponse } = require("../controllers/llmController");

router.post("/", getLLMResponse);

module.exports = router;
