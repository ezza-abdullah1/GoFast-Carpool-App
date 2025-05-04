import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthModalProvider } from "./Components/Authentication/AuthModalContext";
import { Provider } from "react-redux"; 
import  store from "./Components/Authentication/redux/store";    
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthModalProvider>
          <App />
        </AuthModalProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
