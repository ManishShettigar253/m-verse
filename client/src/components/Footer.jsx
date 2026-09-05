import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-clean-bar">
      <div className="footer-clean-inner">
        <p className="footer-text-minimal">
          &copy; {year} mVerse
        </p>

        <div className="footer-links-inline">
          <Link to="/" className="footer-inline-link">Home</Link>
          <span style={{ color: "var(--border-subtle)" }}>•</span>
          <Link to="/chat" className="footer-inline-link">Chat</Link>
          <span style={{ color: "var(--border-subtle)" }}>•</span>
          <Link to="/creator" className="footer-inline-link">Creator</Link>
          <span style={{ color: "var(--border-subtle)" }}>•</span>
          <a
            href="https://www.linkedin.com/in/manish253/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-inline-link"
          >
            LinkedIn
          </a>
          <span style={{ color: "var(--border-subtle)" }}>•</span>
          <a
            href="https://github.com/ManishShettigar253"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-inline-link"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;