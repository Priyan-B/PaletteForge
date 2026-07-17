const BASE = '/api';
 
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || (data.errors && data.errors.join(', ')) || `Request failed (${res.status})`
    );
  }
  return data;
}
 
// contrastPalettes CRUD
export const listPalettes = () => request('/contrast-palettes');
export const getPalette = (id) => request(`/contrast-palettes/${id}`);
export const createPalette = (palette) =>
  request('/contrast-palettes', { method: 'POST', body: JSON.stringify(palette) });
export const updatePalette = (id, palette) =>
  request(`/contrast-palettes/${id}`, { method: 'PUT', body: JSON.stringify(palette) });
export const deletePalette = (id) =>
  request(`/contrast-palettes/${id}`, { method: 'DELETE' });
 
// contrastReports
export const listReports = () => request('/contrast-reports');
export const generateReport = (paletteId) =>
  request('/contrast-reports', { method: 'POST', body: JSON.stringify({ paletteId }) });
export const deleteReport = (id) =>
  request(`/contrast-reports/${id}`, { method: 'DELETE' });
