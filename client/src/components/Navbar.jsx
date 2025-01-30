import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle menu visibility for mobile and tablet
  const toggleMenu = () => setMenuOpen(prevState => !prevState);

  return (
    <nav>
      <div className="logo">
        mVerse
      </div>

      {/* Hamburger button for mobile and tablet view */}
      <button className="menu-toggle" onClick={toggleMenu}>
        &#9776; {/* Hamburger icon */}
      </button>

      {/* Menu */}
      <ul className={`menu ${menuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
        <li><Link to="/chat" onClick={toggleMenu}>Chat</Link></li>
        <li><Link to="/about" onClick={toggleMenu}>About</Link></li>
      </ul>

      <style>{`
        /* General Navbar Styles */
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #2C3E50;
          position: relative;
        }

        .logo {
          font-size: 2rem;
          color: white;
          font-weight: bold;
          padding: 1rem;
          text-align: center;
        }

        /* Menu Styles */
        .menu {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: absolute;
          top: 0;
          left: -100%; /* Initially hide the menu off-screen */
          background-color: #2C3E50;
          width: 0; /* Initially width is 0 */
          height: 100vh; /* Full height of the screen */
          transition: left 0.3s ease-in-out, width 0.3s ease-in-out; /* Smooth transition for width and position */
          z-index: 100;
        }

        .menu.open {
          left: 0; /* Slide the menu into view */
        }

        .menu li {
          margin: 15px 0;
          text-align: center;
        }

        nav a {
          color: white;
          text-decoration: none;
          font-size: 1.1rem;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }

        nav a:hover {
          background-color: #34495E;
        }

        /* Hamburger button for mobile and tablet view */
        .menu-toggle {
          display: none; /* Hidden by default */
          font-size: 2rem;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 200; /* Make sure it's above other elements */
        }

        /* Responsive Layout */
        @media (max-width: 768px) {
          /* Mobile View */
          .menu {
            width: 50%; /* 50% width on mobile */
          }

          .menu.open {
            width: 50%; /* Full width for the menu on mobile */
          }

          .menu-toggle {
            display: block; /* Show hamburger button on mobile */
          }
        }

        @media (max-width: 1024px) and (min-width: 768px) {
          /* Tablet View (for all tablet sizes) */
          .menu {
            width: 30%; /* 30% width on tablet */
          }

          .menu.open {
            width: 30%; /* Full width for the menu on tablet */
          }

          .menu-toggle {
            display: block; /* Show hamburger button on tablet */
          }
        }

        @media (min-width: 1025px) {
          /* Desktop View - Menu is always visible */
          .menu {
            width: auto; /* Menu width is auto on desktop */
            position: static; /* The menu becomes part of the layout */
            flex-direction: row; /* Display the menu items horizontally */
            justify-content: space-around; /* Space the items evenly */
            align-items: center; /* Align items vertically in the center */
            height: auto; /* No need for full height on desktop */
          }

          .menu-toggle {
            display: none; /* Hide the hamburger button on desktop */
          }

          .menu li {
            margin: 0 20px; /* Add horizontal spacing between menu items */
          }

          nav {
            justify-content: space-between; /* Align logo and menu */
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
