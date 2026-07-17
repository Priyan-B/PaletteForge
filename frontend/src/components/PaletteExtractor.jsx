import PropTypes from "prop-types";
import { extractPalette, loadImage } from "../utils/extractPalette.js";
import "./PaletteExtractor.css";

function PaletteExtractor({
  name,
  colors,
  sourceImageName,
  onNameChange,
  onColorsChange,
  onImageExtracted,
  onSave,
  onNew,
}) {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const image = await loadImage(file);
    onImageExtracted(extractPalette(image), file.name);
    event.target.value = "";
  };

  const handleAddColor = () => {
    onColorsChange([...colors, { hex: "#000000" }]);
  };

  const handleColorChange = (index, hex) => {
    onColorsChange(
      colors.map((color, i) => (i === index ? { ...color, hex } : color))
    );
  };

  const handleRemoveColor = (index) => {
    onColorsChange(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="palette-extractor">
      <h3>Palette Builder</h3>
      <div className="palette-header-row">
        <input
          type="text"
          className="palette-name-input"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      {colors.length > 0 && (
        <div className="palette-swatches">
          {colors.map((color, index) => (
            <div key={index} className="palette-swatch">
              <input
                type="color"
                value={color.hex}
                onChange={(event) =>
                  handleColorChange(index, event.target.value)
                }
              />
              {typeof color.prevalence === "number" && (
                <span>{color.prevalence}%</span>
              )}
              <button
                type="button"
                className="palette-swatch-remove"
                onClick={() => handleRemoveColor(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="palette-add-color-row">
        <button
          type="button"
          className="palette-add-color-button"
          onClick={handleAddColor}
        >
          Add Color
        </button>
      </div>
      {sourceImageName && (
        <p className="palette-source">From: {sourceImageName}</p>
      )}
      <div className="palette-save-controls">
        <button type="button" onClick={onSave} disabled={colors.length === 0}>
          Save Palette
        </button>
        <button type="button" onClick={onNew}>
          New
        </button>
      </div>
    </div>
  );
}

PaletteExtractor.propTypes = {
  name: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(
    PropTypes.shape({
      hex: PropTypes.string.isRequired,
      prevalence: PropTypes.number,
    })
  ).isRequired,
  sourceImageName: PropTypes.string.isRequired,
  onNameChange: PropTypes.func.isRequired,
  onColorsChange: PropTypes.func.isRequired,
  onImageExtracted: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
};

export default PaletteExtractor;
