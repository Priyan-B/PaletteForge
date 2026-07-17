import { useState } from "react";
import PropTypes from "prop-types";
import { checkPair, autoFixColor } from "../../utils/wcag";
import "./AutoFix.css";

function AutoFix({ foreground, background, target, onAccept }) {
  const [fg] = useState(foreground);
  const [bg] = useState(background);
  const [fix, setFix] = useState(null);

  const before = safeCheck(fg, bg);

  function run() {
    try {
      setFix(autoFixColor(fg, bg, { target }));
    } catch (e) {
      setFix({ passed: false, note: e.message, fixed: null });
    }
  }

  const afterRatio = fix && fix.fixed ? safeCheck(fix.fixed, bg) : null;

  return (
    <section className="af">
      <h2 className="af__title">Auto-Fix</h2>

      <div className="af__panel">
        <div className="af__side">
          <span className="af__label">Before</span>
          <div className="af__swatch" style={{ background: bg, color: fg }}>
            Aa
          </div>
          <code>{fg}</code>
          <span
            className={`af__ratio ${before && before.AA ? "pass" : "fail"}`}
          >
            {before ? `${before.ratio}:1` : "—"}
          </span>
        </div>

        <div className="af__arrow">→</div>

        <div className="af__side">
          <span className="af__label">After</span>
          <div
            className="af__swatch"
            style={{
              background: bg,
              color: fix && fix.fixed ? fix.fixed : "var(--color-text-dim)",
            }}
          >
            Aa
          </div>
          <code>{fix && fix.fixed ? fix.fixed : "—"}</code>
          <span
            className={`af__ratio ${afterRatio && afterRatio.AA ? "pass" : "fail"}`}
          >
            {afterRatio ? `${afterRatio.ratio}:1` : "—"}
          </span>
        </div>
      </div>

      {fix && fix.note && <p className="af__note">{fix.note}</p>}

      <div className="af__actions">
        <button type="button" onClick={run}>
          Auto-fix foreground
        </button>
        {fix && fix.fixed && (
          <button
            type="button"
            className="af__accept"
            onClick={() => onAccept(fix.fixed)}
          >
            Accept fix
          </button>
        )}
      </div>
    </section>
  );
}

function safeCheck(a, b) {
  try {
    return checkPair(a, b);
  } catch {
    return null;
  }
}

AutoFix.propTypes = {
  foreground: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired,
  target: PropTypes.number,
  onAccept: PropTypes.func,
};

AutoFix.defaultProps = {
  target: 4.5,
  onAccept: () => {},
};

export default AutoFix;
