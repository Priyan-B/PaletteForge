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
    if (!selectedId) return;
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
    <section className="pa">
      <h2 className="pa__title">Audit &amp; Report</h2>

      <div className="pa__controls">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select a palette…</option>
          {palettes.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleGenerate} disabled={!selectedId}>
          Generate report
        </button>
      </div>

      {error && <p className="pa__error">{error}</p>}

      {active && (
        <div className="pa__report">
          <div className="pa__summary">
            <strong>{active.paletteName}</strong> — {active.summary.aaFails} of{" "}
            {active.summary.total} pairs fail AA
          </div>
          <table className="pa__table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Ratio</th>
                <th>AA</th>
                <th>AAA</th>
              </tr>
            </thead>
            <tbody>
              {active.pairs.map((p, i) => (
                <tr key={i}>
                  <td>
                    <span
                      className="pa__chip"
                      style={{ background: p.fgHex }}
                    />
                    <span
                      className="pa__chip"
                      style={{ background: p.bgHex }}
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
                className="pa__ghost"
                onClick={() => handleDelete(r._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default PaletteAudit;
