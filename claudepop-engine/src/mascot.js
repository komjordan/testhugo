// Personnages originaux, silhouettes abstraites florales/géométriques créées
// pour ce projet — aucune ne reprend le design d'un personnage existant.
//
// Bloom : personnage principal, noyau rond à pétales, bras/jambes simples en
//         traits épais façon papier découpé, expressions et poses paramétrées.
// Spark / Glow : personnages secondaires (silhouettes triangle / anneau) pour
//         les scènes de groupe, dessinés avec le même vocabulaire graphique.

function lerp(a, b, t) { return a + (b - a) * t; }

export class Bloom {
  constructor({ palette }) {
    this.palette = palette;
    this.blinkPhase = 0;
    this.nextBlinkAt = 1.5;
  }

  // pose: 'idle' | 'sing' | 'dance-a' | 'dance-b' | 'point' | 'jump'
  // expr: 'neutral' | 'happy' | 'excited' | 'wink' | 'surprised'
  draw(ctx, { x, y, radius, t, energy, pose = 'idle', expr = 'happy', facing = 1 }) {
    const petalCount = 11;
    const breathe = 1 + Math.sin(t * 2.4) * 0.03 * (0.4 + energy);
    const bodyBounce = this._poseBounce(pose, t, energy);

    ctx.save();
    ctx.translate(x, y + bodyBounce.y);
    ctx.scale(facing, 1);
    ctx.rotate(bodyBounce.rot);

    this._drawLimbs(ctx, radius, t, energy, pose, 'back');

    // Pétales
    const petalReach = radius * (1.55 + energy * 0.35) * breathe;
    const petalWidth = radius * (0.62 + energy * 0.1);
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
    ctx.strokeStyle = this.palette.ink;
    ctx.lineWidth = radius * 0.045;
    ctx.stroke();

    this._drawFace(ctx, radius, t, energy, expr, pose);
    this._drawLimbs(ctx, radius, t, energy, pose, 'front');

    ctx.restore();
  }

  _poseBounce(pose, t, energy) {
    switch (pose) {
      case 'dance-a':
        return { y: Math.sin(t * 6) * 8 * (0.5 + energy), rot: Math.sin(t * 3) * 0.09 };
      case 'dance-b':
        return { y: Math.abs(Math.sin(t * 7)) * -14 * (0.5 + energy), rot: Math.sin(t * 4 + 1) * 0.12 };
      case 'jump':
        return { y: Math.abs(Math.sin(t * 5)) * -20, rot: 0 };
      case 'sing':
        return { y: Math.sin(t * 3.2) * 4, rot: Math.sin(t * 1.6) * 0.03 };
      default:
        return { y: Math.sin(t * 1.8) * 3, rot: Math.sin(t * 0.9) * 0.02 };
    }
  }

  _drawLimbs(ctx, radius, t, energy, pose, layer) {
    const armLen = radius * 1.1;
    const legLen = radius * 0.9;
    ctx.save();
    ctx.strokeStyle = this.palette.ink;
    ctx.lineWidth = radius * 0.16;
    ctx.lineCap = 'round';

    let armAngleL, armAngleR, legSpread;
    switch (pose) {
      case 'dance-a':
        armAngleL = -0.6 + Math.sin(t * 6) * 0.5;
        armAngleR = 0.6 - Math.sin(t * 6) * 0.5;
        legSpread = 0.25 + Math.sin(t * 6) * 0.1;
        break;
      case 'dance-b':
        armAngleL = -1.9 + Math.sin(t * 7) * 0.3;
        armAngleR = 1.1 + Math.cos(t * 7) * 0.3;
        legSpread = 0.35;
        break;
      case 'sing':
        armAngleL = -1.3 - Math.sin(t * 2) * 0.15;
        armAngleR = 0.5;
        legSpread = 0.15;
        break;
      case 'point':
        armAngleL = -0.2;
        armAngleR = -1.5;
        legSpread = 0.2;
        break;
      case 'jump':
        armAngleL = -2.0;
        armAngleR = 2.0;
        legSpread = 0.5;
        break;
      default:
        armAngleL = -0.35 + Math.sin(t * 1.6) * 0.08;
        armAngleR = 0.35 - Math.sin(t * 1.6) * 0.08;
        legSpread = 0.18;
    }

    if (layer === 'back') {
      // Jambe arrière (légère, sous le noyau)
      ctx.beginPath();
      ctx.moveTo(-radius * 0.3, radius * 0.5);
      ctx.lineTo(-radius * 0.3 - Math.sin(legSpread) * legLen, radius * 0.5 + Math.cos(legSpread) * legLen);
      ctx.stroke();
    } else {
      // Bras avant + jambe avant
      ctx.beginPath();
      ctx.moveTo(radius * 0.75, -radius * 0.1);
      ctx.lineTo(radius * 0.75 + Math.cos(armAngleR) * armLen, -radius * 0.1 + Math.sin(armAngleR) * armLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-radius * 0.75, -radius * 0.1);
      ctx.lineTo(-radius * 0.75 + Math.cos(Math.PI - armAngleL) * armLen, -radius * 0.1 + Math.sin(Math.PI - armAngleL) * armLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(radius * 0.3, radius * 0.5);
      ctx.lineTo(radius * 0.3 + Math.sin(legSpread) * legLen, radius * 0.5 + Math.cos(legSpread) * legLen);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawFace(ctx, radius, t, energy, expr, pose) {
    this._updateBlink(t);
    const blink = expr === 'wink' ? 1 : this.blinkPhase;
    const eyeR = radius * 0.09 * (1 - blink * 0.85);

    ctx.save();
    ctx.fillStyle = this.palette.face;

    const eyeOffsets = expr === 'wink' ? [1, 0] : [1, 1];
    [-1, 1].forEach((side, idx) => {
      const closeFactor = side < 0 ? blink : (expr === 'wink' ? this.blinkPhase : blink);
      const er = radius * 0.09 * (1 - closeFactor * (side < 0 || expr !== 'wink' ? 0.85 : 1));
      ctx.beginPath();
      ctx.ellipse(side * radius * 0.22, -radius * 0.02, er, er, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const singOpen = pose === 'sing' ? (0.18 + Math.max(0, Math.sin(t * 8)) * 0.22) : 0;
    const mouthOpen = 0.06 + energy * 0.1 + singOpen;
    ctx.strokeStyle = this.palette.face;
    ctx.lineWidth = radius * 0.05;
    ctx.lineCap = 'round';
    if (expr === 'excited' || pose === 'sing') {
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.22, radius * 0.16, radius * (0.1 + singOpen), 0, 0, Math.PI * 2);
      ctx.fillStyle = this.palette.ink;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, radius * 0.18, radius * 0.22, mouthOpen, Math.PI - mouthOpen);
      ctx.stroke();
    }

    if (expr === 'surprised') {
      ctx.beginPath();
      ctx.arc(0, radius * 0.24, radius * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = this.palette.ink;
      ctx.fill();
    }
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

// Silhouette secondaire triangulaire, pour les scènes de groupe.
export class Spark {
  constructor({ color }) { this.color = color; }
  draw(ctx, { x, y, size, t, energy, phase = 0 }) {
    const bob = Math.sin(t * 7 + phase) * size * 0.18 * (0.5 + energy);
    const spin = Math.sin(t * 2 + phase) * 0.25;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(spin);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#1c1a17';
    ctx.lineWidth = size * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.87, size * 0.5);
    ctx.lineTo(-size * 0.87, size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // yeux minimalistes
    ctx.fillStyle = '#1c1a17';
    ctx.beginPath();
    ctx.arc(-size * 0.18, size * 0.05, size * 0.08, 0, Math.PI * 2);
    ctx.arc(size * 0.18, size * 0.05, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Silhouette secondaire en anneau, pour les scènes de groupe.
export class Glow {
  constructor({ color }) { this.color = color; }
  draw(ctx, { x, y, size, t, energy, phase = 0 }) {
    const bob = Math.cos(t * 6 + phase) * size * 0.2 * (0.5 + energy);
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#1c1a17';
    ctx.lineWidth = size * 0.16;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1c1a17';
    ctx.beginPath();
    ctx.arc(-size * 0.18, -size * 0.05, size * 0.07, 0, Math.PI * 2);
    ctx.arc(size * 0.18, -size * 0.05, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
