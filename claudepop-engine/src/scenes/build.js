import { easeOutExpo } from './text-fx.js';

// Scène "build" : les mots arrivent un par un et s'empilent en colonne, façon
// montée en tension avant un refrain.
export function drawBuild(ctx, { w, h, cue, localT, palette }) {
  const words = cue.text.split(' ');
  const perWord = 1 / words.length;
  const fontSize = Math.min(w * 0.075, h * 0.09);
  const lineHeight = fontSize * 1.1;
  const totalH = lineHeight * words.length;
  let y = h / 2 - totalH / 2 + lineHeight / 2;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;

  words.forEach((word, i) => {
    const start = i * perWord;
    const local = Math.max(0, Math.min(1, (localT - start) / (perWord * 1.4)));
    if (local <= 0) { y += lineHeight; return; }
    const slide = (1 - easeOutExpo(local)) * w * 0.25;
    ctx.save();
    ctx.globalAlpha = local;
    ctx.translate(w / 2 + slide * (i % 2 === 0 ? 1 : -1), y);
    ctx.fillStyle = i % 2 === 0 ? palette.ink : palette.accentC;
    ctx.fillText(word, 0, 0);
    ctx.restore();
    y += lineHeight;
  });
  ctx.restore();
}
