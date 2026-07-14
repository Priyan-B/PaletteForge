import { useEffect, useState } from "react";

function IndexPage() {
  const [wireframes, setWireframes] = useState([]);

  useEffect(() => {
    fetch("/api/wireframes")
      .then((response) => response.json())
      .then((data) => setWireframes(data));
  }, []);

  return (
    <div>
      <h1>IndexPage</h1>
      <ul>
        {wireframes.map((wireframe) => (
          <li key={wireframe.id}>{wireframe.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default IndexPage;
