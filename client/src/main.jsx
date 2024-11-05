import React from "react";
import ReactDOM from "react-dom/client";
import PatentChecker from "./components/PatentChecker";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <PatentChecker />
    </div>
  </React.StrictMode>
);
