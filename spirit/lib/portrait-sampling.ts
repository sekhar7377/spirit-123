/** Weighted sampling spends points on the figure rather than the empty black frame.
 * A deterministic shuffled sequence keeps lower draw budgets spatially complete.
 */
export function samplePortrait(data: Uint8ClampedArray, width: number, height: number, count: number) {
  const cumulative = new Float64Array(width * height);
  let total = 0;
  const light = (i: number) => (.2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2]) / 255;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const pixel = y * width + x, i = pixel * 4, l = light(i);
    const edge = Math.abs(l - light((y * width + Math.max(0, x - 1)) * 4));
    const face = Math.exp(-((x / width - .62) ** 2 / .009 + (y / height - .22) ** 2 / .02));
    total += l > .025 ? (.12 + Math.sqrt(l) * .8 + edge * 2) * (1 + face * 1.8) : 0;
    cumulative[pixel] = total;
  }
  if (!total) throw new Error('Portrait has no visible sampling surface');
  let state = 731;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const points = new Float32Array(count * 2);
  for (let n = 0; n < count; n++) {
    const target = random() * total;
    let lo = 0, hi = cumulative.length - 1;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (cumulative[mid] < target) lo = mid + 1; else hi = mid; }
    points[n * 2] = (lo % width + random()) / width;
    points[n * 2 + 1] = 1 - (Math.floor(lo / width) + random()) / height;
  }
  return points;
}
