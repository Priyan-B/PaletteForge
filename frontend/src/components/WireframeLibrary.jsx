import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { listWireframes, deleteWireframe } from "../api/wireframes.js";
import "./WireframeLibrary.css";

function WireframeLibrary({ refreshKey, onLoad, onDelete }) {
  const [wireframes, setWireframes] = useState([]);

  useEffect(() => {
    listWireframes().then(setWireframes);
  }, [refreshKey]);

  const handleDelete = async (wireframe) => {
    await deleteWireframe(wireframe._id);
    setWireframes((prev) => prev.filter((w) => w._id !== wireframe._id));
    onDelete(wireframe._id);
  };

  return (
    <div className="wireframe-library">
      <h3>My Wireframes</h3>
      {wireframes.length === 0 && <p>No saved wireframes yet.</p>}
      <ul>
        {wireframes.map((wireframe) => (
          <li key={wireframe._id} className="wireframe-library-item">
            <span>{wireframe.name}</span>
            <div className="wireframe-library-actions">
              <button type="button" onClick={() => onLoad(wireframe)}>
                Load
              </button>
              <button type="button" onClick={() => handleDelete(wireframe)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

WireframeLibrary.propTypes = {
  refreshKey: PropTypes.number.isRequired,
  onLoad: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default WireframeLibrary;
