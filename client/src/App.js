// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const isChat = location.pathname === "/chat";

  return (
    <div className={`app-wrapper ${isChat ? "chat-page-wrapper" : ""}`}>
      <Navbar />
      <main className={`main-content ${isChat ? "chat-main-content" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/creator" element={<About />} />
          <Route path="/developer" element={<About />} />
          <Route path="/about" element={<About />} />
          <Route path="/About" element={<About />} />
        </Routes>
      </main>
      {!isChat && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
