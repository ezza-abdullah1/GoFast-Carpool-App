import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthModalProvider } from "./Components/Authentication/AuthModalContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthModalProvider>
    <App />
  </AuthModalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
