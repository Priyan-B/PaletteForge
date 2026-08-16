import { useState, useEffect, useId } from "react";
import PropTypes from "prop-types";
import { checkPair, autoFixColor } from "../../../utils/wcag";
import "./AutoFix.css";

function safeCheck(a, b, opts) {
  try {
    return checkPair(a, b, opts);
  } catch {
    return null;
  }
}

/**
 * Rendered inside ContrastChecker whenever the current pair fails AA.
 * Nudges the foreground's lightness until it meets the target, keeping hue.
 */
function AutoFix({
  foreground,
  background,
  target = 4.5,
  large = false,
  onAccept = () => {},
}) {
  const [fix, setFix] = useState(null);
  const titleId = useId();

  useEffect(() => {
    setFix(null);
  }, [foreground, background, large]);

  const before = safeCheck(foreground, background, { large });
  const after =
    fix && fix.fixed ? safeCheck(fix.fixed, background, { large }) : null;

  function run() {
    try {
      setFix(autoFixColor(foreground, background, { target, large }));
    } catch (e) {
      setFix({ passed: false, note: e.message, fixed: null });
    }
  }

  return (
    <section className="af" aria-labelledby={titleId}>
      <h3 className="af__title" id={titleId}>
        Fix this colour
      </h3>
      <p className="af__intro">
        This pair fails AA. Auto-Fix adjusts the foreground&rsquo;s lightness
        until it passes, keeping the same hue.
      </p>

      <div className="af__panel">
        <div className="af__side">
          <span className="af__label">Before</span>
          <div
            className="af__swatch"
            style={{ background: background, color: foreground }}
            aria-hidden="true"
          >
            Aa
          </div>
          <code>{foreground}</code>
          <span
            className={`af__ratio ${before && before.AA ? "pass" : "fail"}`}
          >
            {before ? `${before.ratio}:1` : "—"}
          </span>
        </div>
        <div className="af__arrow" aria-hidden="true">
          →
        </div>
        <div className="af__side">
          <span className="af__label">After</span>
          <div
            className="af__swatch"
            style={{
              background: background,
              color: fix && fix.fixed ? fix.fixed : "var(--color-text-dim)",
            }}
            aria-hidden="true"
          >
            Aa
          </div>
          <code>{fix && fix.fixed ? fix.fixed : "—"}</code>
          <span className={`af__ratio ${after && after.AA ? "pass" : "fail"}`}>
            {after ? `${after.ratio}:1` : "—"}
          </span>
        </div>
      </div>

      <div className="af__status" role="status">
        {fix && fix.fixed && (
          <p className="af__summary">
            Fixed foreground <code>{fix.fixed}</code> at {fix.achievedRatio}:1{" "}
            <span className={after && after.AA ? "pass" : "fail"}>
              {after && after.AA ? "AA Pass" : "AA Fail"}
            </span>
          </p>
        )}
        {fix && fix.note && <p className="af__note">{fix.note}</p>}
      </div>

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
            Use this colour
          </button>
        )}
      </div>
    </section>
  );
}

AutoFix.propTypes = {
  foreground: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired,
  target: PropTypes.number,
  large: PropTypes.bool,
  onAccept: PropTypes.func,
};

export default AutoFix;
