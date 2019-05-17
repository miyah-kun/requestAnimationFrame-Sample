function generateCSSCubicBezier(x1, y1, x2, y2, step) {
  const table = generateTable(x1, x2, step);
  const tableSize = table.length;
  cubicBezier.getT = getT;
  cubicBezier.table = table;
  return cubicBezier;
  function cubicBezier(x) {
      if (x <= 0) {
          return 0;
      }
      if (1 <= x) {
          return 1;
      }
      return getCoordinate(y1, y2, getT(x));
  }
  function getT(x) {
      let xt1, xt0;
      if (x < 0.5) {
          for (let i = 1; i < tableSize; i++) {
              xt1 = table[i];
              if (x <= xt1[0]) {
                  xt0 = table[i - 1];
                  break;
              }
          }
      } else {
          for (let i = tableSize - 1; i--;) {
              xt1 = table[i];
              if (xt1[0] <= x) {
                  xt0 = table[i + 1];
                  break;
              }
          }
      }
      return xt0[1] + (x - xt0[0]) * (xt1[1] - xt0[1]) / (xt1[0] - xt0[0]);
  }
  function getCoordinate(z1, z2, t) {
      return (3 * z1 - 3 * z2 + 1) * t * t * t + (-6 * z1 + 3 * z2) * t * t + 3 * z1 * t;
  }
  function generateTable(x1, x2, step) {
      step = step || 1 / 30;
      const table = [[0, 0]];
      for (let t = step, previousX = 0; t < 1; t += step) {
          const x = getCoordinate(x1, x2, t);
          if (previousX < x) {
              table.push([x, t]);
              previousX = x;
          }
      }
      table.push([1, 1]);
      return table;
  }
}

const easeInOut = generateCSSCubicBezier(0.42, 0, 0.58, 1);

function draw(ctx, t) {
  ctx.save();
  const canvas = ctx.canvas;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = devicePixelRatio * 20 + 'px Courier,monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
      new Date().toISOString(),
      canvas.width / 2,
      canvas.height / 2
  );
  const phase1 = (t % 2000) / 2000;
  const phase2 = 2 * Math.max(phase1 - 0.5, 0);
  const phase3 = (t % 5000) / 5000;
  const x1 = easeInOut(phase1);
  const x2 = easeInOut(phase2);
  const radius = 0.4 * Math.min(canvas.width, canvas.height);
  const PI2 = Math.PI * 2;
  ctx.beginPath();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(2 * Math.PI * phase3);
  ctx.arc(0, 0, radius, PI2 * x2, PI2 * x1);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = radius / 6;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
  drawParams(ctx, [
    ['phase1', phase1],
    ['phase2', phase2],
  ]);
}

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

function onResize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
}
window.addEventListener('resize', onResize);
onResize();

requestAnimationFrame(function (t0) {
  const ctx = canvas.getContext('2d');
  render(t0);
  function render(t1) {
      ctx.fillStyle = '#55c500';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      draw(ctx, t1 - t0);
      requestAnimationFrame(render);
  }
});

function drawParams(ctx, params) {
  ctx.save();
  const length = params.length;
  const radius = devicePixelRatio * 8;
  const lineHeight = devicePixelRatio * 20;
  const width = Math.min(ctx.canvas.width / 2, devicePixelRatio * 300);
  const height = length * lineHeight;
  const margin = devicePixelRatio * 16 + radius;
  const x = ctx.canvas.width - width - margin;
  const y = ctx.canvas.height - height;
  ctx.font = [(devicePixelRatio * 14) + 'px', 'Courier'].join(' ');
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = devicePixelRatio;
  for (let i = 0; i < length; i++) {
    const param = params[i];
    const paramY = y + i * lineHeight;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(param[0], x, paramY);
    ctx.textAlign = 'right';
    ctx.fillText(param[1].toFixed(2), x + width, paramY);
    ctx.beginPath();
    ctx.moveTo(x, paramY);
    ctx.lineTo(x + width, paramY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + width * param[1], paramY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#f2c507';
    ctx.fill();
  }
  ctx.restore();
}