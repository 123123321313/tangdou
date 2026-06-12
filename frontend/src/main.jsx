import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

function bootstrap() {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Tell the splash screen the app has rendered.
  setTimeout(function () { window.dispatchEvent(new Event("app-ready")); }, 60);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}