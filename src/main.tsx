
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

// Import our refactored CSS files in the correct order
import "./styles/base.css";
import "./styles/components.css";
import "./styles/animations.css";
import "./styles/layout.css";
import "./styles/gradients.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
