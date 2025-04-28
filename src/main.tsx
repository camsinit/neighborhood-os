
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Add import for BrowserRouter
import App from "./App.tsx";

// Import our refactored CSS files in the correct order
// First base styles with Tailwind base directive
import "./styles/base.css";
// Then component styles with Tailwind components directive
import "./styles/components.css";
// Then the rest of our styles
import "./styles/animations.css";
import "./styles/layout.css";
import "./styles/gradients.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* Wrap the App component with BrowserRouter to provide routing context */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
