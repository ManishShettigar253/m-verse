import Avatar from '../assets/Avatar.jpeg';
import { FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaGlobe } from 'react-icons/fa';

const About = () => {
  
  const developer = {
    name: "Manish",
    designation: "Software Engineer Intern at IBM",
    location: "Mangalore, India",
    image: Avatar,
    linkedin: "https://www.linkedin.com/in/manish-3b6142207/",
    github: "https://github.com/ManishShettigar253",
    instagram: "https://www.instagram.com/manish__shettigar/profilecard/?igsh=aGlwemQwdzc2N3g2",
    youtube: "https://www.youtube.com/@wanderlustEngineer253",
    portfolio: "https://manishshettigar253.github.io/Manish_Portfolio/",
  };

  return (
    <div className="about-container">
      {/* About Project Section */}
      <section className="about-project">
        <div className="about-header">
          <h1>Welcome to mVerse</h1>
                <p className="intro">
                    LLM Connect is an advanced AI-powered chat application built using React, Node.js, and Gemini's cutting-edge language models. It offers a seamless and interactive experience, allowing users to engage in intelligent conversations, get personalized responses, and explore the power of AI in real-time. As I continue to develop the app, I’m focused on enhancing its capabilities, expanding features, and improving the overall user experience.
                </p>
        </div>

        <div className="content-container">
          <div className="objective-card">
            <h2>Our Objectives</h2>
            <ul>
              <li>Well Versed LLM Application</li>
              <li>Provide a simple interface to add, update, and delete books.</li>
              <li>Ensure scalability and fast performance with Latest Tech stack.</li>
            </ul>
          </div>

          <div className="tech-card">
            <h2>Tech Stack</h2>
            <ul>
              <li><strong>React.js</strong> - Frontend library for building UIs</li>
              <li><strong>Express.js</strong> - Backend framework for Node.js</li>
              <li><strong>Node.js</strong> - JavaScript runtime for server-side code</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Developer Information Section */}
      <section className="about-developer">
        <h2>Meet the Developer</h2>
        <div className="developer-card">
          <img src={developer.image} alt="Developer" className="developer-photo" />
          <div className="developer-details">
            <h3>{developer.name}</h3>
            <p><strong>{developer.designation}</strong></p>
            <p>{developer.location}</p>
            <div className="social-links">
              {developer.linkedin && <a href={developer.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>}
              {developer.github && <a href={developer.github} target="_blank" rel="noopener noreferrer"><FaGithub /></a>}
              {developer.instagram && <a href={developer.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>}
              {developer.youtube && <a href={developer.youtube} target="_blank" rel="noopener noreferrer"><FaYoutube /></a>}
              {developer.portfolio && <a href={developer.portfolio} target="_blank" rel="noopener noreferrer"><FaGlobe/></a>
}

            </div>
          </div>
        </div>
      </section>

      <style>{`
        .about-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem;
          font-family: 'Roboto', sans-serif;
          color: #333;
        }

        .about-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .about-header h1 {
          font-size: 3rem;
          color: #2C3E50;
          font-weight: bold;
        }

        .intro {
          font-size: 1.2rem;
          color: #7f8c8d;
          max-width: 800px;
          margin: 0 auto;
        }

        .content-container {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-top: 2rem;
        }

        .objective-card, .tech-card {
          background-color: #ecf0f1;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          flex: 1;
          min-width: 280px;
        }

        .objective-card h2, .tech-card h2 {
          color: #2C3E50;
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .objective-card ul, .tech-card ul {
          list-style-type: disc;
          padding-left: 20px;
          color: #34495e;
        }

        .objective-card li, .tech-card li {
          font-size: 1.1rem;
          margin: 0.5rem 0;
        }

        .about-developer {
          margin-top: 4rem;
          text-align: center;
        }

        .about-developer h2 {
          font-size: 2.5rem;
          color: #2C3E50;
        }

        .developer-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #f9fafb;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
        }

        .developer-photo {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 1.5rem;
        }

        .developer-details h3 {
          font-size: 2rem;
          color: #2C3E50;
          margin-bottom: 1rem;
        }

        .developer-details p {
          font-size: 1.1rem;
          color: #7f8c8d;
        }

        .social-links {
          margin-top: 1rem;
        }

        .social-links a {
          font-size: 1.5rem;
          margin: 0.5rem 1rem;
          text-decoration: none;
          color: #3498db;
          transition: color 0.3s ease;
        }

        .social-links a:hover {
          color: #2980b9;
        }

        .social-links i {
          margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
          .content-container {
            flex-direction: column;
            gap: 40px;
          }

          .objective-card, .tech-card {
            min-width: 100%;
          }

          .developer-card {
            width: 100%;
            margin-top: 2rem;
          }
        }

        @media (max-width: 430px) {
          .about-container {
            padding: 1rem 8px;  /* Smaller padding to prevent content from touching edges */
          }

          .content-container {
            flex-direction: column;
            gap: 30px; /* Reduced gap for mobile devices */
          }

          .objective-card, .tech-card {
            min-width: 100%;  /* Full width for mobile */
            padding: 1rem;  /* Adding padding to ensure some breathing room */
          }

          .developer-card {
            width: 100%;
            padding: 1rem;
            margin-top: 2rem;
          }

          .developer-photo {
            width: 120px; /* Smaller image for mobile */
            height: 120px;
          }

          .developer-details h3 {
            font-size: 1.5rem; /* Smaller text size */
          }

          .developer-details p {
            font-size: 1rem;  /* Adjust text size for smaller screens */
          }

          .social-links a {
            font-size: 1rem;  /* Adjust font size of social links */
            margin: 0.5rem 0;  /* Stack social links vertically */
          }

          .social-links i {
            margin-right: 0.5rem;
          }
        }

      `}</style>
    </div>
  );
};

export default About;
