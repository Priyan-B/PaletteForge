import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  listPalettes,
  createPalette,
  updatePalette,
  deletePalette,
} from "../../../api/contrastApi";
import { ROLES } from "../../../utils/roles";
import "./PaletteBuilder.css";

function PaletteBuilder({ prefillColors }) {
  const emptyColors = ROLES.map((role) => ({ role, hex: "#000000" }));

  const [name, setName] = useState("");
  const [colors, setColors] = useState(
    prefillColors && prefillColors.length ? prefillColors : emptyColors
  );
  const [saved, setSaved] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      setSaved(await listPalettes());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function setRoleColor(role, hex) {
    setColors((prev) => {
      const exists = prev.find((c) => c.role === role);
      if (exists) return prev.map((c) => (c.role === role ? { ...c, hex } : c));
      return [...prev, { role, hex }];
    });
  }

  function colorFor(role) {
    const c = colors.find((x) => x.role === role);
    return c ? c.hex : "#000000";
  }

  async function handleSave() {
    setError(null);
    const payload = { name: name || "Untitled palette", colors };
    try {
      if (editingId) await updatePalette(editingId, payload);
      else await createPalette(payload);
      resetForm();
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  function startEdit(p) {
    setEditingId(p._id);
    setName(p.name);
    setColors(p.colors);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setColors(emptyColors);
  }

  async function handleDelete(id) {
    try {
      await deletePalette(id);
      if (editingId === id) resetForm();
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="pb">
      <h2 className="pb__title">Palette Builder</h2>

      <input
        className="pb__name"
        type="text"
        placeholder="Palette name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="pb__roles">
        {ROLES.map((role) => (
          <label key={role} className="pb__role">
            <span>{role}</span>
            <input
              type="color"
              value={colorFor(role)}
              onChange={(e) => setRoleColor(role, e.target.value)}
            />
            <code>{colorFor(role)}</code>
          </label>
        ))}
      </div>

      <div className="pb__actions">
        <button type="button" onClick={handleSave}>
          {editingId ? "Update palette" : "Save palette"}
        </button>
        {editingId && (
          <button type="button" className="pb__ghost" onClick={resetForm}>
            Cancel
          </button>
        )}
      </div>

      {error && <p className="pb__error">{error}</p>}

      <h3 className="pb__subtitle">Saved palettes</h3>
      {loading ? (
        <p className="pb__muted">Loading…</p>
      ) : saved.length === 0 ? (
        <p className="pb__muted">
          No palettes yet. Build one above to get started.
        </p>
      ) : (
        <ul className="pb__list">
          {saved.map((p) => (
            <li key={p._id} className="pb__item">
              <div className="pb__swatches">
                {p.colors.map((c) => (
                  <span
                    key={c.role}
                    className="pb__swatch"
                    style={{ background: c.hex }}
                    title={`${c.role}: ${c.hex}`}
                  />
                ))}
              </div>
              <span className="pb__itemname">{p.name}</span>
              <button
                type="button"
                className="pb__ghost"
                onClick={() => startEdit(p)}
              >
                Edit
              </button>
              <button
                type="button"
                className="pb__ghost"
                onClick={() => handleDelete(p._id)}
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

PaletteBuilder.propTypes = {
  prefillColors: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string.isRequired,
      hex: PropTypes.string.isRequired,
    })
  ),
};

PaletteBuilder.defaultProps = {
  prefillColors: undefined,
};

export default PaletteBuilder;
