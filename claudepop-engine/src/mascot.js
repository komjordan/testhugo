// Mascotte originale "Bloom" — un personnage abstrait floral/solaire créé pour ce
// projet. Design original : noyau circulaire dégradé + pétales géométriques
// arrondies, aucun accessoire, aucun vêtement, silhouette non figurative.
// Ne reproduit le design d'aucun personnage existant.

export class Bloom {
  constructor({ palette }) {
    this.palette = palette;
    this.blinkPhase = 0;
    this.nextBlinkAt = 1.5;
  }

  // t: temps du morceau en secondes. energy: 0..1 (intensité de la section courante).
  draw(ctx, { x, y, radius, t, energy }) {
    const petalCount = 11;
    const breathe = 1 + Math.sin(t * 2.4) * 0.03 * (0.4 + energy);
    const petalReach = radius * (1.55 + energy * 0.35) * breathe;
    const petalWidth = radius * (0.62 + energy * 0.1);

    ctx.save();
    ctx.translate(x, y);

    // Pétales
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + t * (0.15 + energy * 0.25);
      const wob = Math.sin(t * 3 + i) * 0.06 * energy;
      ctx.save();
      ctx.rotate(angle + wob);
      const grad = ctx.createLinearGradient(0, -radius * 0.4, 0, -petalReach);
      grad.addColorStop(0, this.palette.petalInner);
      grad.addColorStop(1, this.palette.petalOuter);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.35);
      ctx.quadraticCurveTo(petalWidth * 0.5, -petalReach * 0.55, 0, -petalReach);
      ctx.quadraticCurveTo(-petalWidth * 0.5, -petalReach * 0.55, 0, -radius * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Noyau
    const coreGrad = ctx.createRadialGradient(0, -radius * 0.2, radius * 0.1, 0, 0, radius);
    coreGrad.addColorStop(0, this.palette.coreLight);
    coreGrad.addColorStop(1, this.palette.coreDark);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Visage minimal — yeux + bouche, clignement périodique
    this._updateBlink(t);
    const blink = this.blinkPhase;
    const eyeR = radius * 0.09 * (1 - blink * 0.85);
    ctx.fillStyle = this.palette.face;
    ctx.beginPath();
    ctx.ellipse(-radius * 0.22, -radius * 0.02, eyeR, eyeR * (1 - blink * 0.6), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(radius * 0.22, -radius * 0.02, eyeR, eyeR * (1 - blink * 0.6), 0, 0, Math.PI * 2);
    ctx.fill();

    const mouthOpen = 0.06 + energy * 0.12 + Math.max(0, Math.sin(t * 6)) * 0.05 * energy;
    ctx.strokeStyle = this.palette.face;
    ctx.lineWidth = radius * 0.05;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, radius * 0.18, radius * 0.22, mouthOpen, Math.PI - mouthOpen);
    ctx.stroke();

    ctx.restore();
  }

  _updateBlink(t) {
    if (t > this.nextBlinkAt) {
      this.blinkPhase = 1;
      this.nextBlinkAt = t + 2.5 + Math.random() * 2.5;
    }
    if (this.blinkPhase > 0) {
      this.blinkPhase = Math.max(0, this.blinkPhase - 0.12);
    }
  }
}
