import { drawStudioEnvironment } from '../environments.js';
import { easeOutExpo } from './text-fx.js';

// Scène narrative : Bloom dans un décor détaillé, la caméra dérive lentement
// (dolly), le texte est intégré au décor (posé sur un "écran" prop plutôt que
// flottant au centre de l'écran).
export function drawNarrative(ctx, { w, h, cue, localT, cueDuration, palette, energy, t, camera, mascot }) {
  camera.setKeyframes([
    { t: 0, x: 0, y: 0, zoom: 1.06, rot: -0.01 },
    { t: cueDuration, x: -w * 0.03, y: -h * 0.01, zoom: 1.0, rot: 0.01 }
  ]);
  camera.setShake(0);

  ctx.save();
  camera.apply(ctx, w, h, localT, t);
  drawStudioEnvironment(ctx, w, h, t, palette);

  const enter = Math.min(1, localT / 0.6);
  const walkIn = (1 - easeOutExpo(enter)) * w * 0.25;
  const bloomX = w * 0.32 + walkIn;
  const bloomY = h * 0.56;
  const radius = Math.min(w, h) * 0.1;
  mascot.draw(ctx, {
    x: bloomX, y: bloomY, radius, t, energy,
    pose: cue.pose || 'point', expr: cue.expr || 'happy'
  });

  // "Écran" diégétique portant le texte — un panneau posé dans le décor,
  // pas un sous-titre flottant.
  const panelW = w * 0.52, panelH = h * 0.16;
  const panelX = w * 0.62, panelY = h * 0.3;
  const panelIn = Math.min(1, Math.max(0, (localT - 0.3) / 0.5));
  ctx.save();
  ctx.globalAlpha = panelIn;
  ctx.translate(panelX, panelY - (1 - panelIn) * 14);
  ctx.fillStyle = palette.paper;
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, -panelW / 2, -panelH / 2, panelW, panelH, 14);
  ctx.fill();
  ctx.stroke();

  const fontSize = Math.min(panelW * 0.11, panelH * 0.34);
  ctx.font = `800 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  wrapText(ctx, cue.text, 0, 0, panelW * 0.86, fontSize * 1.12);
  ctx.restore();

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, cx, cy, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const startY = cy - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineHeight));
}
