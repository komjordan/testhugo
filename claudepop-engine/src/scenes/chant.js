import { easeOutBack } from './text-fx.js';

// Scène "chant" : le hook répété du refrain, énorme, pulsant, occupe tout le cadre.
export function drawChant(ctx, { w, h, cue, localT, cueDuration, palette }) {
  const pulse = 1 + Math.sin((localT / cueDuration) * Math.PI * 6) * 0.035;
  const enter = Math.min(1, localT / 0.3);
  const scale = easeOutBack(enter) * pulse;
  let fontSize = Math.min(w * 0.16, h * 0.2);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
  const maxTextWidth = w * 0.88;
  const measured = ctx.measureText(cue.text).width;
  if (measured > maxTextWidth) {
    fontSize *= maxTextWidth / measured;
    ctx.font = `900 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
  }

  ctx.translate(w / 2, h / 2);
  ctx.scale(scale, scale);
  ctx.rotate(Math.sin(localT * 1.3) * 0.02);

  // Ombre décalée façon sérigraphie
  ctx.fillStyle = palette.accentB;
  ctx.fillText(cue.text, fontSize * 0.05, fontSize * 0.06);
  ctx.fillStyle = palette.accentA;
  ctx.fillText(cue.text, 0, 0);
  ctx.restore();
}
