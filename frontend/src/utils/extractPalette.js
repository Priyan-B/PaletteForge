const SAMPLE_SIZE = 50;
const ROUND_TO = 24;
const ALPHA_THRESHOLD = 128;

function roundChannel(value) {
  return Math.min(255, Math.round(value / ROUND_TO) * ROUND_TO);
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")
  );
}

export function extractPalette(image, topN = 5) {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  const buckets = new Map();
  let totalPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < ALPHA_THRESHOLD) continue;

    const r = roundChannel(data[i]);
    const g = roundChannel(data[i + 1]);
    const b = roundChannel(data[i + 2]);
    const key = `${r},${g},${b}`;

    buckets.set(key, (buckets.get(key) || 0) + 1);
    totalPixels += 1;
  }

  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([key, count]) => {
      const [r, g, b] = key.split(",").map(Number);
      return {
        hex: rgbToHex(r, g, b),
        prevalence: Math.round((count / totalPixels) * 100),
      };
    });
}

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}
