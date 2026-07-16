import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { checkPair } from '../../utils/wcag';
import './ContrastChecker.css';

function ContrastChecker({ initialForeground, initialBackground }) {
  const [fg, setFg] = useState(initialForeground);
  const [bg, setBg] = useState(initialBackground);
  const [largeText, setLargeText] = useState(false);

  const result = useMemo(() => {
    try {
      return checkPair(fg, bg, { large: largeText });
    } catch {
      return null;
    }
  }, [fg, bg, largeText]);

  return (
    <section className="cc">
      <h2 className="cc__title">Contrast Checker</h2>

      <div className="cc__inputs">
        <label className="cc__field">
          <span>Foreground</span>
          <div className="cc__row">
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
            <input
              type="text"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              aria-label="Foreground hex"
            />
          </div>
        </label>

        <label className="cc__field">
          <span>Background</span>
          <div className="cc__row">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
            <input
              type="text"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              aria-label="Background hex"
            />
          </div>
        </label>
      </div>

      <label className="cc__toggle">
        <input
          type="checkbox"
          checked={largeText}
          onChange={(e) => setLargeText(e.target.checked)}
        />
        Large text (18pt+ or 14pt bold)
      </label>

      <div className="cc__preview" style={{ background: bg, color: fg }}>
        The quick brown fox jumps over the lazy dog
      </div>

      {result && (
        <div className="cc__result">
          <div className="cc__ratio">{result.ratio}:1</div>
          <div className="cc__badges">
            <span className={`cc__badge ${result.AA ? 'pass' : 'fail'}`}>
              AA {result.AA ? 'Pass' : 'Fail'}
            </span>
            <span className={`cc__badge ${result.AAA ? 'pass' : 'fail'}`}>
              AAA {result.AAA ? 'Pass' : 'Fail'}
            </span>
          </div>
          <p className="cc__thresholds">
            Needs {result.thresholds.AA}:1 for AA, {result.thresholds.AAA}:1 for AAA
          </p>
        </div>
      )}
    </section>
  );
}

ContrastChecker.propTypes = {
  initialForeground: PropTypes.string,
  initialBackground: PropTypes.string,
};

ContrastChecker.defaultProps = {
  initialForeground: '#1A1A1A',
  initialBackground: '#FFFFFF',
};

export default ContrastChecker;