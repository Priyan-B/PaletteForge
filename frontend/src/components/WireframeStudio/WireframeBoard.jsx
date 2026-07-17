import PropTypes from "prop-types";
import Shape from "./Shape.jsx";
import "./WireframeBoard.css";

function WireframeBoard({
  shapes,
  selectedId = null,
  onSelect,
  onChange,
  onDeselect,
}) {
  return (
    <div className="wireframe-board-wrapper">
      <div
        className="wireframe-board"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onDeselect();
          }
        }}
      >
        {shapes.map((shape) => (
          <Shape
            key={shape.id}
            shape={shape}
            isSelected={shape.id === selectedId}
            onSelect={onSelect}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

WireframeBoard.propTypes = {
  shapes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["rect", "circle"]).isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      fillColor: PropTypes.string.isRequired,
      showText: PropTypes.bool,
      textColor: PropTypes.string,
    })
  ).isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
};

export default WireframeBoard;
