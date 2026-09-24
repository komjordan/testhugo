// Scène "outro" : texte discret, fondu, pour les crédits ou fins de section.
export function drawOutro(ctx, { w, h, cue, localT, cueDuration, palette }) {
  const fadeIn = Math.min(1, localT / 0.5);
  const fadeOut = Math.min(1, (cueDuration - localT) / 0.5);
  const alpha = Math.min(fadeIn, fadeOut);
  const fontSize = Math.min(w * 0.045, h * 0.06);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${fontSize}px "Helvetica Neue", sans-serif`;
  ctx.fillStyle = palette.ink;
  ctx.fillText(cue.text, w / 2, h * 0.85);
  ctx.restore();
}
