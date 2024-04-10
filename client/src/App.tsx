import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";

/* No FR-Foundational App file */
function App() {
  return <RouterProvider router={router} />
}

export default App;
