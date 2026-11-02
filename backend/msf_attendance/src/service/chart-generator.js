const { PNG } = require('pngjs');

// Simple software bitmap drawing helpers for pristine PNG Bar Charts
function createBarChartBuffer({ title, data, width = 620, height = 340, barColor = [37, 99, 235] }) {
  const png = new PNG({ width, height });

  // 1. Fill background with light neutral (#ffffff)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = 255;     // R
      png.data[idx + 1] = 255; // G
      png.data[idx + 2] = 255; // B
      png.data[idx + 3] = 255; // A
    }
  }

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (width * y + x) << 2;
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
  }

  function drawRect(x0, y0, w, h, r, g, b) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        setPixel(x, y, r, g, b);
      }
    }
  }

  function drawLine(x0, y0, x1, y1, r, g, b) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;
    while (true) {
      setPixel(x, y, r, g, b);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  // Draw border
  for (let x = 0; x < width; x++) {
    setPixel(x, 0, 226, 232, 240);
    setPixel(x, height - 1, 226, 232, 240);
  }
  for (let y = 0; y < height; y++) {
    setPixel(0, y, 226, 232, 240);
    setPixel(width - 1, y, 226, 232, 240);
  }

  // Chart area
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 50;
  const paddingBottom = 60;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const zeroY = paddingTop + chartHeight;

  // Draw Grid lines
  const maxVal = Math.max(5, ...data.map(d => d.value));
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const yVal = zeroY - Math.round((i / gridSteps) * chartHeight);
    for (let gx = paddingLeft; gx < width - paddingRight; gx += 4) {
      setPixel(gx, yVal, 226, 232, 240); // dashed line
    }
  }

  // Axes lines
  drawLine(paddingLeft, zeroY, width - paddingRight, zeroY, 71, 85, 105);
  drawLine(paddingLeft, paddingTop, paddingLeft, zeroY, 71, 85, 105);

  // Draw bars
  const count = data.length || 1;
  const barSlotWidth = chartWidth / count;
  const barWidth = Math.max(8, Math.min(45, Math.floor(barSlotWidth * 0.65)));

  data.forEach((item, index) => {
    const barHeight = Math.round((item.value / maxVal) * chartHeight);
    const barX = Math.round(paddingLeft + index * barSlotWidth + (barSlotWidth - barWidth) / 2);
    const barY = zeroY - barHeight;

    // Bar fill
    drawRect(barX, barY, barWidth, barHeight, barColor[0], barColor[1], barColor[2]);
    // Bar top accent line
    drawRect(barX, barY, barWidth, 2, 30, 41, 59);
  });

  return PNG.sync.write(png);
}

module.exports = { createBarChartBuffer };
