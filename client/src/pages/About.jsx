import React from "react";
import Avatar from "../assets/Avatar.jpeg";
import {
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";
import "./About.css";

const About = () => {
  const developer = {
    name: "Manish",
    designation: "Software Engineer at IBM",
    location: "Mangalore, India",
    image: Avatar,
    linkedin: "https://www.linkedin.com/in/manish253/",
    github: "https://github.com/ManishShettigar253",
    instagram:
      "https://www.instagram.com/manish__shettigar/profilecard/?igsh=aGlwemQwdzc2N3g2",
    youtube: "https://www.youtube.com/@wanderlustEngineer253",
    portfolio: "https://manishshettigar253.github.io/Manish_Portfolio/",
  };

  return (
    <div className="about-clean-page">
      <div className="about-header-minimal">
        <h1>Creator & Architect</h1>
      </div>

      <div className="about-profile-box">
        <img
          src={developer.image}
          alt={developer.name}
          className="about-avatar-circle"
        />

        <div className="about-dev-name">{developer.name}</div>
        <div className="about-dev-role">{developer.designation}</div>
        <div className="about-dev-location">{developer.location}</div>

        <div className="about-social-row">
          {developer.linkedin && (
            <a
              href={developer.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="about-social-icon"
              aria-label="LinkedIn Profile"
              title="Connect on LinkedIn"
            >
              <FaLinkedin />
            </a>
          )}
          {developer.github && (
            <a
              href={developer.github}
              target="_blank"
              rel="noopener noreferrer"
              className="about-social-icon"
              aria-label="GitHub Profile"
              title="View GitHub Projects"
            >
              <FaGithub />
            </a>
          )}
          {developer.portfolio && (
            <a
              href={developer.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="about-social-icon"
              aria-label="Personal Portfolio"
              title="Visit Portfolio"
            >
              <FaGlobe />
            </a>
          )}
          {developer.youtube && (
            <a
              href={developer.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="about-social-icon"
              aria-label="YouTube Channel"
              title="YouTube"
            >
              <FaYoutube />
            </a>
          )}
          {developer.instagram && (
            <a
              href={developer.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="about-social-icon"
              aria-label="Instagram Profile"
              title="Instagram"
            >
              <FaInstagram />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
