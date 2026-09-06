// server/routes/llmRoutes.js
const express = require("express");
const router = express.Router();
const { getLLMResponse, getLLMTitle } = require("../controllers/llmController");

router.post("/", getLLMResponse);
router.post("/title", getLLMTitle);

module.exports = router;
