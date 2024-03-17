import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/ctx";
import { Lobby } from "../data/model";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const ctx = useContext(GameContext);

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
      <h2 onClick={() => {
        const sock = ctx.connectWs(ctx.setScreen);
        sock.onopen = () => {
          sock.send("test");
        };
        sock.onmessage = (m) => {
          const lobby: Lobby = JSON.parse(m.data);
          console.log(lobby);
          sock.close();
        }
      }}>Test Sock</h2>
    </header>
  );
};

export default Home;
