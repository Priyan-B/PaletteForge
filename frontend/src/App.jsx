import { useState } from "react";
import WireframeStudio from "./components/WireframeStudio/WireframeStudio.jsx";
import AccessibilityToolkit from "./components/AccessibilityToolkit/AccessibilityToolkit.jsx";
import "./App.css";

const VIEWS = {
  wireframes: { label: "Wireframe Studio" },
  contrast: { label: "Accessibility Toolkit" },
};

function App() {
  const [currentView, setCurrentView] = useState("wireframes");
  const [handoffColors, setHandoffColors] = useState(null);

  const handleSendToAccessibility = (colors) => {
    setHandoffColors(colors);
    setCurrentView("contrast");
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <h1 className="app-title">PaletteForge</h1>
        <div className="app-nav-tabs">
          {Object.entries(VIEWS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              className={
                key === currentView ? "app-nav-tab active" : "app-nav-tab"
              }
              onClick={() => setCurrentView(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
      <p className="mobile-notice">
        PaletteForge works best on a larger screen — dragging, resizing, and
        color picking may not work well on mobile.
      </p>
      <main className="app-main">
        {currentView === "wireframes" ? (
          <WireframeStudio onSendToAccessibility={handleSendToAccessibility} />
        ) : (
          <AccessibilityToolkit incomingColors={handoffColors} />
        )}
      </main>
      <footer className="app-footer">
        <span>PaletteForge &copy; {new Date().getFullYear()}</span>
        <span>Aishwarya Rajmohan &amp; Priyan Baskar</span>
        <a
          href="https://github.com/Priyan-B/PaletteForge"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
