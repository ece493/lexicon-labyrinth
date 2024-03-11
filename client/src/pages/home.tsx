import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ClientContext } from "../ws-client/context/client-ctx";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const ctx = useContext(ClientContext);

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
        const sock = ctx.connect();
        sock.onopen = () => {
          sock.send("test");
        };
        sock.onmessage = (m) => {
          console.log(m.data);
          sock.close();
        }
      }}>Test Sock</h2>
    </header>
  );
};

export default Home;
