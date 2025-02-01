// src/services/api.js
import axios from "axios";

// Use the environment variable to set the base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_BASEURL + "/api", // Use .env variable for the base URL
});

export const getLLMResponse = async (input) => {
  try {
    const res = await api.post("/llm", { input });
    return res.data;
  } catch (error) {
    console.error("Error in API call", error);
    throw error;
  }
};
