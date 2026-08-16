import { useState } from "react";
import PropTypes from "prop-types";
import ContrastChecker from "./ContrastChecker/ContrastChecker.jsx";
import PaletteBuilder from "./PaletteBuilder/PaletteBuilder.jsx";
import PaletteAudit from "./PaletteAudit/PaletteAudit.jsx";
import "./AccessibilityToolkit.css";

/**
 * Auto-Fix is no longer a top-level tool. Usability testing showed all three
 * participants expected the fix to live beside the contrast result, so it is
 * now rendered inside ContrastChecker when a pairing fails.
 */
const TOOLS = {
  checker: "Contrast Checker",
  builder: "Palette Builder",
  audit: "Audit & Report",
};

function AccessibilityToolkit({ incomingColors = undefined }) {
  const [tool, setTool] = useState(incomingColors ? "builder" : "checker");
  const [pair, setPair] = useState({ fg: "#4A7BA7", bg: "#5B3A8F" });

  return (
    <div className="atk">
      <div className="atk__tabs">
        {Object.entries(TOOLS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={key === tool}
            className={key === tool ? "atk__tab active" : "atk__tab"}
            onClick={() => setTool(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="atk__panel">
        {tool === "checker" && (
          <ContrastChecker
            foreground={pair.fg}
            background={pair.bg}
            onChange={(fg, bg) => setPair({ fg, bg })}
          />
        )}
        {tool === "builder" && (
          <PaletteBuilder prefillColors={incomingColors} />
        )}
        {tool === "audit" && <PaletteAudit />}
      </div>
    </div>
  );
}

AccessibilityToolkit.propTypes = {
  incomingColors: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string.isRequired,
      hex: PropTypes.string.isRequired,
    })
  ),
};

export default AccessibilityToolkit;
