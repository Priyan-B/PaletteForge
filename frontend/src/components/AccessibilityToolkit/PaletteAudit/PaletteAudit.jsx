import { useState, useEffect } from "react";
import {
  listPalettes,
  listReports,
  generateReport,
  deleteReport,
} from "../../../api/contrastApi";
import "./PaletteAudit.css";

function PaletteAudit() {
  const [palettes, setPalettes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [reports, setReports] = useState([]);
  const [active, setActive] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setPalettes(await listPalettes());
        setReports(await listReports());
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  async function refreshReports() {
    try {
      setReports(await listReports());
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleGenerate() {
    // Kept focusable via aria-disabled so keyboard and screen reader users get
    // an explanation instead of a silently inert button.
    if (!selectedId) {
      setError("Select a palette from the list first.");
      return;
    }
    setError(null);
    try {
      const report = await generateReport(selectedId);
      setActive(report);
      refreshReports();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteReport(id);
      if (active && active._id === id) setActive(null);
      refreshReports();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="pa" aria-labelledby="pa-title">
      <h2 className="pa__title" id="pa-title">
        Audit &amp; Report
      </h2>
      <p className="pa__intro">
        Pick a saved palette to check every role pairing against the WCAG AA
        contrast threshold.
      </p>

      <div className="pa__controls">
        <div className="pa__field">
          <label className="pa__label" htmlFor="pa-palette">
            Palette
          </label>
          <select
            id="pa-palette"
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setError(null);
            }}
          >
            <option value="">Select a palette…</option>
            {palettes.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          aria-disabled={!selectedId}
          aria-describedby="pa-generate-hint"
          title={
            selectedId ? undefined : "Select a palette to generate a report"
          }
        >
          Generate report
        </button>
      </div>
      <p className="pa__hint" id="pa-generate-hint">
        Select a palette to enable the report.
      </p>

      {error && (
        <p className="pa__error" role="alert">
          {error}
        </p>
      )}

      {active && (
        <div className="pa__report">
          <p className="pa__summary">
            <strong>{active.paletteName}</strong> — {active.summary.aaFails} of{" "}
            {active.summary.total} pairs fail AA
          </p>
          <table className="pa__table">
            <caption className="pa__caption">
              Contrast results for each role pairing
            </caption>
            <thead>
              <tr>
                <th scope="col">Pair</th>
                <th scope="col">Ratio</th>
                <th scope="col">AA</th>
                <th scope="col">AAA</th>
              </tr>
            </thead>
            <tbody>
              {active.pairs.map((p) => (
                <tr key={`${p.fgRole}-${p.bgRole}`}>
                  <td>
                    <span
                      className="pa__chip"
                      style={{ background: p.fgHex }}
                      aria-hidden="true"
                    />
                    <span
                      className="pa__chip"
                      style={{ background: p.bgHex }}
                      aria-hidden="true"
                    />
                    {p.fgRole} on {p.bgRole}
                  </td>
                  <td>{p.ratio}:1</td>
                  <td className={p.AA ? "pass" : "fail"}>
                    {p.AA ? "Pass" : "Fail"}
                  </td>
                  <td className={p.AAA ? "pass" : "fail"}>
                    {p.AAA ? "Pass" : "Fail"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="pa__muted">
            A failing pair means text in that colour will be hard to read on
            that background. Open the Contrast Checker to adjust and fix it.
          </p>
        </div>
      )}

      <h3 className="pa__subtitle">Saved reports</h3>
      {reports.length === 0 ? (
        <p className="pa__muted">No saved reports yet.</p>
      ) : (
        <ul className="pa__list">
          {reports.map((r) => (
            <li key={r._id} className="pa__item">
              <button
                type="button"
                className="pa__link"
                onClick={() => setActive(r)}
              >
                {r.paletteName}
              </button>
              <span className="pa__muted">
                {r.summary.aaFails}/{r.summary.total} fail AA
              </span>
              <button
                type="button"
                className="pa__ghost danger"
                onClick={() => handleDelete(r._id)}
              >
                Delete
                <span className="pa__sr"> {r.paletteName} report</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default PaletteAudit;
