import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header>
      <h1>Home Page</h1>
      <h2
        onClick={() => {
          navigate("/lobby/testId");
        }}
      >
        Click to go to Lobby test page
      </h2>
      <h2
        onClick={() => {
          navigate("/game/testId");
        }}
      >
        Click to go to Game test page
      </h2>
    </header>
  );
};

export default Home;
