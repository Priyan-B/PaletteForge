const BASE_URL = "/api/palettes/extracted";

export async function listPalettes() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to load palettes");
  return res.json();
}

export async function createPalette(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create palette");
  return res.json();
}

export async function updatePalette(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update palette");
  return res.json();
}

export async function deletePalette(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete palette");
}
