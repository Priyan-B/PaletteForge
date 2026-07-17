import PropTypes from "prop-types";
import "./PaletteApplyPanel.css";

function PaletteApplyPanel({ palette, canMatch, onMatch, onShuffle }) {
  return (
    <div className="palette-apply-panel">
      <h4>Selected: {palette.name}</h4>
      <div className="palette-apply-swatches">
        {palette.colors.map((color, index) => (
          <button
            key={index}
            type="button"
            className="palette-apply-swatch"
            style={{ backgroundColor: color.hex }}
            disabled={!canMatch}
            title={
              canMatch
                ? `Apply ${color.hex} to selected shape`
                : "Select a shape first"
            }
            onClick={() => onMatch(color.hex)}
          />
        ))}
      </div>
      <button type="button" onClick={onShuffle}>
        Shuffle
      </button>
    </div>
  );
}

PaletteApplyPanel.propTypes = {
  palette: PropTypes.shape({
    name: PropTypes.string.isRequired,
    colors: PropTypes.arrayOf(
      PropTypes.shape({
        hex: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  canMatch: PropTypes.bool.isRequired,
  onMatch: PropTypes.func.isRequired,
  onShuffle: PropTypes.func.isRequired,
};

export default PaletteApplyPanel;
