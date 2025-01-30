// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",  // Replace with your backend URL
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
