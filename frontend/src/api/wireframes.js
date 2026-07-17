const BASE_URL = "/api/wireframes";

export async function listWireframes() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to load wireframes");
  return res.json();
}

export async function createWireframe(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create wireframe");
  return res.json();
}

export async function updateWireframe(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update wireframe");
  return res.json();
}

export async function deleteWireframe(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete wireframe");
}
