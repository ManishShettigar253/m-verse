import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { HiBars3, HiXMark, HiArrowUpRight } from "react-icons/hi2";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand */}
        <Link className="brand-link" to="/" onClick={closeMenu}>
          <div className="brand-logo-mark">m</div>
          <span className="brand-title">mVerse</span>
          <span className="brand-model-tag">v2.0</span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links-desktop">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link-item ${isActive ? "active" : ""}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `nav-link-item ${isActive ? "active" : ""}`
                }
              >
                Chat
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/creator"
                className={({ isActive }) =>
                  `nav-link-item ${isActive ? "active" : ""}`
                }
              >
                Creator
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Right Actions - Highlights Manish to Recruiters */}
        <div className="navbar-actions">
          <Link
            to="/creator"
            className="navbar-creator-badge"
            title="View Manish's Profile & Experience"
          >
            <span className="creator-dot-pulse"></span>
            <span>Manish</span>
            <span style={{ color: "var(--border-subtle)" }}>•</span>
            <span className="creator-role-subtle">SWE @ IBM</span>
          </Link>

          <Link to="/chat" className="navbar-cta-btn">
            <span>Open Chat</span>
            <HiArrowUpRight />
          </Link>

          <button
            className="menu-toggle-btn"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? <HiXMark /> : <HiBars3 />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay & Drawer */}
      <div
        className={`mobile-overlay ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
      />

      <aside className={`mobile-menu-drawer ${menuOpen ? "open" : ""}`}>
        <div className="mobile-drawer-header">
          <div className="brand-link">
            <div className="brand-logo-mark">m</div>
            <span className="brand-title">mVerse</span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <HiXMark />
          </button>
        </div>

        <ul className="mobile-nav-links">
          <li>
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/chat"
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
            >
              Chat
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/creator"
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
            >
              Creator
            </NavLink>
          </li>
        </ul>

        <div className="mobile-cta-wrapper">
          <Link to="/chat" onClick={closeMenu} className="mobile-cta-btn">
            <span>Open Chat</span>
            <HiArrowUpRight />
          </Link>
        </div>
      </aside>
    </header>
  );
};

export default Navbar;
