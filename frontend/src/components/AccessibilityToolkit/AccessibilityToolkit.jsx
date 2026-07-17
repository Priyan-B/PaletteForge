import { useState } from "react";
import PropTypes from "prop-types";
import ContrastChecker from "../ContrastChecker/ContrastChecker.jsx";
import PaletteBuilder from "../PaletteBuilder/PaletteBuilder.jsx";
import PaletteAudit from "../PaletteAudit/PaletteAudit.jsx";
import AutoFix from "../AutoFix/AutoFix.jsx";
import "./AccessibilityToolkit.css";

const TOOLS = {
  checker: "Contrast Checker",
  builder: "Palette Builder",
  audit: "Audit & Report",
  autofix: "Auto-Fix",
};

function AccessibilityToolkit({ incomingColors }) {
  const [tool, setTool] = useState(incomingColors ? "builder" : "checker");
  const [fixPair, setFixPair] = useState({ fg: "#4A7BA7", bg: "#5B3A8F" });

  return (
    <div className="atk">
      <div className="atk__tabs">
        {Object.entries(TOOLS).map(([key, label]) => (
          <button
            key={key}
            type="button"
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
            foreground={fixPair.fg}
            background={fixPair.bg}
            onChange={(fg, bg) => setFixPair({ fg, bg })}
          />
        )}

        {tool === "builder" && (
          <PaletteBuilder prefillColors={incomingColors} />
        )}
        {tool === "audit" && <PaletteAudit />}
        {tool === "autofix" && (
          <AutoFix
            foreground={fixPair.fg}
            background={fixPair.bg}
            onAccept={(hex) => setFixPair((p) => ({ ...p, fg: hex }))}
          />
        )}
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

AccessibilityToolkit.defaultProps = {
  incomingColors: undefined,
};

export default AccessibilityToolkit;
