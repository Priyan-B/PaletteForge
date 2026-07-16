import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { listPalettes, deletePalette } from "../api/palettes.js";
import "./PaletteLibrary.css";

function PaletteLibrary({ refreshKey, onSelect, onEdit, onDelete }) {
  const [palettes, setPalettes] = useState([]);

  useEffect(() => {
    listPalettes().then(setPalettes);
  }, [refreshKey]);

  const handleDelete = async (palette) => {
    await deletePalette(palette._id);
    setPalettes((prev) => prev.filter((p) => p._id !== palette._id));
    onDelete(palette._id);
  };

  return (
    <div className="palette-library">
      <h3>My Palettes</h3>
      {palettes.length === 0 && <p>No saved palettes yet.</p>}
      <ul>
        {palettes.map((palette) => (
          <li key={palette._id} className="palette-library-item">
            <div className="palette-library-swatches">
              {palette.colors.map((color, index) => (
                <span
                  key={index}
                  className="palette-library-swatch"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
            <span>{palette.name}</span>
            <div className="palette-library-actions">
              <button type="button" onClick={() => onSelect(palette)}>
                Apply
              </button>
              <button type="button" onClick={() => onEdit(palette)}>
                Edit
              </button>
              <button type="button" onClick={() => handleDelete(palette)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

PaletteLibrary.propTypes = {
  refreshKey: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default PaletteLibrary;
