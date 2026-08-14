import { useState } from "react";
import PropTypes from "prop-types";
import "./Shape.css";

const DEFAULT_TEXT = "Double-click to edit";

const MIN_SIZE = 20;
const CORNERS = ["nw", "ne", "sw", "se"];

function resizeFromCorner(corner, origin, dx, dy) {
  const growX = corner.includes("e") ? 1 : -1;
  const growY = corner.includes("s") ? 1 : -1;

  const width = Math.max(MIN_SIZE, origin.width + growX * dx);
  const height = Math.max(MIN_SIZE, origin.height + growY * dy);

  const x = corner.includes("w") ? origin.x + (origin.width - width) : origin.x;
  const y = corner.includes("n")
    ? origin.y + (origin.height - height)
    : origin.y;

  return { x, y, width, height };
}

function trackDrag(onMove, onEnd) {
  const handleMouseMove = (event) => onMove(event);
  const handleMouseUp = (event) => {
    onEnd?.(event);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
}

function Shape({ shape, isSelected, onSelect, onChange }) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [draftText, setDraftText] = useState(shape.text ?? DEFAULT_TEXT);

  const startEditingText = (event) => {
    event.stopPropagation();
    setDraftText(shape.text ?? DEFAULT_TEXT);
    setIsEditingText(true);
  };

  const commitText = () => {
    setIsEditingText(false);
    onChange(shape.id, { text: draftText });
  };

  const cancelEditingText = () => {
    setDraftText(shape.text ?? DEFAULT_TEXT);
    setIsEditingText(false);
  };

  const startMove = (event) => {
    event.stopPropagation();
    onSelect(shape.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = { x: shape.x, y: shape.y };

    trackDrag((moveEvent) => {
      onChange(shape.id, {
        x: origin.x + (moveEvent.clientX - startX),
        y: origin.y + (moveEvent.clientY - startY),
      });
    });
  };

  const startResize = (corner) => (event) => {
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    };

    trackDrag((moveEvent) => {
      onChange(
        shape.id,
        resizeFromCorner(
          corner,
          origin,
          moveEvent.clientX - startX,
          moveEvent.clientY - startY
        )
      );
    });
  };

  const style = {
    left: shape.x,
    top: shape.y,
    width: shape.width,
    height: shape.height,
    backgroundColor: shape.fillColor,
    borderRadius: shape.type === "circle" ? "50%" : "4px",
  };

  return (
    <div
      className={isSelected ? "shape shape-selected" : "shape"}
      style={style}
      onMouseDown={startMove}
    >
      {shape.showText && isEditingText && (
        <input
          type="text"
          className="shape-text-input"
          style={{ color: shape.textColor }}
          value={draftText}
          autoFocus
          onMouseDown={(event) => event.stopPropagation()}
          onChange={(event) => setDraftText(event.target.value)}
          onBlur={commitText}
          onKeyDown={(event) => {
            if (event.key === "Enter") commitText();
            if (event.key === "Escape") cancelEditingText();
          }}
        />
      )}
      {shape.showText && !isEditingText && (
        <span
          className="shape-text"
          style={{ color: shape.textColor }}
          onDoubleClick={startEditingText}
        >
          {shape.text || DEFAULT_TEXT}
        </span>
      )}
      {isSelected &&
        CORNERS.map((corner) => (
          <div
            key={corner}
            className={`shape-handle shape-handle-${corner}`}
            onMouseDown={startResize(corner)}
          />
        ))}
    </div>
  );
}

Shape.propTypes = {
  shape: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["rect", "circle"]).isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    fillColor: PropTypes.string.isRequired,
    showText: PropTypes.bool,
    textColor: PropTypes.string,
    text: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Shape;
