import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { checkPair } from "../../../utils/wcag";
import AutoFix from "../AutoFix/AutoFix.jsx";
import "./ContrastChecker.css";

function ContrastChecker({
  foreground = "#1A1A1A",
  background = "#FFFFFF",
  onChange = () => {},
}) {
  const [largeText, setLargeText] = useState(false);
  const fg = foreground;
  const bg = background;
  const result = useMemo(() => {
    try {
      return checkPair(fg, bg, { large: largeText });
    } catch {
      return null;
    }
  }, [fg, bg, largeText]);

  return (
    <section className="cc" aria-labelledby="cc-title">
      <h2 className="cc__title" id="cc-title">
        Contrast Checker
      </h2>
      <div className="cc__inputs">
        <div className="cc__field">
          <span className="cc__fieldlabel" id="cc-fg-label">
            Foreground
          </span>
          <div className="cc__row">
            <input
              type="color"
              value={fg}
              onChange={(e) => onChange(e.target.value, bg)}
              aria-label="Foreground colour picker"
            />
            <input
              type="text"
              value={fg}
              onChange={(e) => onChange(e.target.value, bg)}
              aria-label="Foreground hex value"
              spellCheck="false"
            />
          </div>
        </div>
        <div className="cc__field">
          <span className="cc__fieldlabel" id="cc-bg-label">
            Background
          </span>
          <div className="cc__row">
            <input
              type="color"
              value={bg}
              onChange={(e) => onChange(fg, e.target.value)}
              aria-label="Background colour picker"
            />
            <input
              type="text"
              value={bg}
              onChange={(e) => onChange(fg, e.target.value)}
              aria-label="Background hex value"
              spellCheck="false"
            />
          </div>
        </div>
      </div>

      <label className="cc__toggle" htmlFor="cc-large">
        <input
          id="cc-large"
          type="checkbox"
          checked={largeText}
          onChange={(e) => setLargeText(e.target.checked)}
        />
        Large text (18pt+ or 14pt bold)
      </label>

      {/*
        The preview deliberately renders the chosen pair, which may fail
        contrast. It is decorative: the ratio and pass/fail state below are
        the accessible source of truth, so the sample text is hidden from
        assistive technology rather than reported as a contrast violation.
      */}
      <div
        className="cc__preview"
        style={{ background: bg, color: fg }}
        aria-hidden="true"
      >
        Web Development under Prof. John Alexis Guerra Gómez is Fun
      </div>
      <p className="cc__previewnote">Live preview of the selected colours.</p>

      {result && (
        <div className="cc__result" aria-live="polite">
          <p className="cc__ratio">{result.ratio}:1</p>
          <div className="cc__badges">
            <span className={`cc__badge ${result.AA ? "pass" : "fail"}`}>
              AA {result.AA ? "Pass" : "Fail"}
            </span>
            <span className={`cc__badge ${result.AAA ? "pass" : "fail"}`}>
              AAA {result.AAA ? "Pass" : "Fail"}
            </span>
          </div>
          <p className="cc__thresholds">
            Needs {result.thresholds.AA}:1 for AA, {result.thresholds.AAA}:1 for
            AAA
          </p>
        </div>
      )}

      {result && !result.AA && (
        <AutoFix
          foreground={fg}
          background={bg}
          large={largeText}
          onAccept={(hex) => onChange(hex, bg)}
        />
      )}
    </section>
  );
}

ContrastChecker.propTypes = {
  foreground: PropTypes.string,
  background: PropTypes.string,
  onChange: PropTypes.func,
};

export default ContrastChecker;
