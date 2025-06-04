
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/global.css";

// Import development server handler
import { initializeDevServerHandler } from './utils/developmentServerHandler';

// Initialize development server handling to prevent infinite loops
initializeDevServerHandler();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
