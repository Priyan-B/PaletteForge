import { useState } from "react";
import WireframeBoard from "./WireframeBoard.jsx";
import WireframeLibrary from "./WireframeLibrary.jsx";
import PaletteExtractor from "./PaletteExtractor.jsx";
import PaletteLibrary from "./PaletteLibrary.jsx";
import { createWireframe, updateWireframe } from "../api/wireframes.js";
import "./WireframeStudio.css";

const DEFAULT_SIZE = { width: 120, height: 80 };

function createShape(type) {
  return {
    id: crypto.randomUUID(),
    type,
    x: 40,
    y: 40,
    width: DEFAULT_SIZE.width,
    height: type === "circle" ? DEFAULT_SIZE.width : DEFAULT_SIZE.height,
    fillColor: "#ffffff",
    showText: false,
    textColor: "#000000",
  };
}

function WireframeStudio() {
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState("Untitled Wireframe");
  const [refreshKey, setRefreshKey] = useState(0);
  const [paletteRefreshKey, setPaletteRefreshKey] = useState(0);
  const [selectedPalette, setSelectedPalette] = useState(null);

  const addShape = (type) => {
    const shape = createShape(type);
    setShapes((prev) => [...prev, shape]);
    setSelectedId(shape.id);
  };

  const updateShape = (id, updates) => {
    setShapes((prev) =>
      prev.map((shape) => (shape.id === id ? { ...shape, ...updates } : shape))
    );
  };

  const deleteShape = (id) => {
    setShapes((prev) => prev.filter((shape) => shape.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const handleNew = () => {
    setShapes([]);
    setSelectedId(null);
    setCurrentId(null);
    setName("Untitled Wireframe");
  };

  const handleSave = async () => {
    if (currentId) {
      await updateWireframe(currentId, { name, shapes });
    } else {
      const created = await createWireframe({ name, shapes });
      setCurrentId(created._id);
    }
    setRefreshKey((key) => key + 1);
  };

  const handleLoad = (wireframe) => {
    setShapes(wireframe.shapes);
    setSelectedId(null);
    setCurrentId(wireframe._id);
    setName(wireframe.name);
  };

  const handleLibraryDelete = (deletedId) => {
    if (deletedId === currentId) {
      handleNew();
    }
  };

  const selectedShape = shapes.find((shape) => shape.id === selectedId);

  return (
    <div className="wireframe-studio">
      <div className="wireframe-toolbar">
        <div className="wireframe-item-controls">
          <input
            type="text"
            className="wireframe-name-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button type="button" onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={handleNew}>
            New
          </button>
        </div>
        <div className="wireframe-addshape-buttons">
          <button type="button" onClick={() => addShape("rect")}>
            Add Rectangle
          </button>
          <button type="button" onClick={() => addShape("circle")}>
            Add Circle
          </button>
        </div>
        <div
          className={
            selectedShape
              ? "wireframe-shape-controls"
              : "wireframe-shape-controls disabled"
          }
        >
          <label className="wireframe-color-picker">
            Fill
            <input
              type="color"
              value={selectedShape ? selectedShape.fillColor : "#cccccc"}
              disabled={!selectedShape}
              onChange={(event) =>
                selectedShape &&
                updateShape(selectedShape.id, { fillColor: event.target.value })
              }
            />
          </label>
          <div className="wireframe-text-group">
            <label className="wireframe-text-toggle">
              Add Text
              <input
                type="checkbox"
                checked={selectedShape ? selectedShape.showText : false}
                disabled={!selectedShape}
                onChange={(event) =>
                  selectedShape &&
                  updateShape(selectedShape.id, {
                    showText: event.target.checked,
                  })
                }
              />
            </label>
            <label className="wireframe-color-picker">
              Text colour
              <input
                type="color"
                value={selectedShape ? selectedShape.textColor : "#000000"}
                disabled={!selectedShape}
                onChange={(event) =>
                  selectedShape &&
                  updateShape(selectedShape.id, {
                    textColor: event.target.value,
                  })
                }
              />
            </label>
          </div>
          <button
            type="button"
            disabled={!selectedShape}
            onClick={() => selectedShape && deleteShape(selectedShape.id)}
          >
            Delete Shape
          </button>
        </div>
      </div>
      <WireframeBoard
        shapes={shapes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onChange={updateShape}
        onDeselect={() => setSelectedId(null)}
      />
      <WireframeLibrary
        refreshKey={refreshKey}
        onLoad={handleLoad}
        onDelete={handleLibraryDelete}
      />
      <PaletteExtractor
        onSaved={() => setPaletteRefreshKey((key) => key + 1)}
      />
      <PaletteLibrary
        refreshKey={paletteRefreshKey}
        onSelect={setSelectedPalette}
      />
      {selectedPalette && <p>Selected palette: {selectedPalette.name}</p>}
    </div>
  );
}

export default WireframeStudio;
