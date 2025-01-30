
import { useNavigate } from "react-router-dom";
import "./Home.css"; // Optional: to style with your custom CSS

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome to My LLM App</h1>
        <p>Your personalized AI assistant is just a click away.</p>
        <button onClick={() => navigate("/chat")} className="enter-chat-btn">
          Start Chat
        </button>
      </div>
    </div>
  );
}

export default Home;
