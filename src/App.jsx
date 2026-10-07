import React, { useState, useEffect } from "react";
import Home from "./app/page.jsx";
import TemplatesPage from "./app/templates/page.jsx";
import "./app/globals.css";

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="app-root-wrapper min-h-screen relative">
      {currentPath.startsWith("/templates") ? <TemplatesPage /> : <Home />}
    </div>
  );
}
