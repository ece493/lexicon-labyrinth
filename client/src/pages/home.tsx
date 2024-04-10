import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/ctx";
import { Lobby, Action, ScreenState } from "../data/model";
import { ActionsList } from "../ws-client/model";
import { connect } from "../ws-client/client";

// No FR - For Tests
const Home: React.FC = () => {
  const navigate = useNavigate();
  const ctx = useContext(GameContext);

  return (
    <header>
      <h1>Home Page</h1>
      <h2 onClick={() => ctx.setScreen(ScreenState.LOBBY)}>
        Click to go to Lobby test page
      </h2>
      {/* <h2
        onClick={() => {
          ctx.setScreen(ScreenState.END);
          ctx.sock = connect(ctx.setLobby, ctx.setPlayerId, ctx.setScreen, ctx.receiveCallBacks);
          ctx.sock.onopen = () => {
            ctx.transitions.initialize(ctx);
            ctx.transitions.readyLobby(ctx);
          };
        }}
      >
        Click to go to End Game Page
      </h2> */}
      <h2 onClick={() => ctx.setScreen(ScreenState.NAME_ENTRY)}>
        Click to go to Name Entry test page
      </h2>
      <h2 onClick={() => ctx.setScreen(ScreenState.LOBBY_CODE_ENTRY)}>
        Click to go to Lobby Code Entry test page
      </h2>
      <h2 onClick={() => ctx.setScreen(ScreenState.START)}>
        Click to go to the Start Screen
      </h2>
      <h2
        onClick={() => {
          ctx.transitions.initialize(ctx);
        }}
      >
        Test Sock Outward
      </h2>
    </header>
  );
};

export default Home;
