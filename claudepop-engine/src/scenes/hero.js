import { wrapLines, easeOutBack } from './text-fx.js';

// Scène "hero" : titre/accroche géant, plein écran, utilisée pour les ouvertures
// de section fortes (intro, drop de refrain).
export function drawHero(ctx, { w, h, cue, localT, palette, energy }) {
  const lines = wrapLines(cue.text);
  const enter = Math.min(1, localT / 0.45);
  const scale = 0.7 + easeOutBack(enter) * 0.3;
  let fontSize = Math.min(w * 0.13, h * 0.16);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
  const maxTextWidth = w * 0.88;
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  if (widest > maxTextWidth) {
    fontSize *= maxTextWidth / widest;
    ctx.font = `900 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
  }

  ctx.translate(w / 2, h / 2);
  ctx.scale(scale, scale);

  const lineHeight = fontSize * 1.05;
  const totalH = lineHeight * lines.length;

  lines.forEach((line, i) => {
    const ly = -totalH / 2 + lineHeight * i + lineHeight / 2;
    ctx.lineWidth = fontSize * 0.09;
    ctx.strokeStyle = palette.ink;
    ctx.strokeText(line, 0, ly);
    ctx.fillStyle = i % 2 === 0 ? palette.accentA : palette.accentB;
    ctx.fillText(line, 0, ly);
  });
  ctx.restore();
}
