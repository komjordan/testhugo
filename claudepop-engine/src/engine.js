import { PALETTE } from './palette.js';
import { Bloom, Spark, Glow } from './mascot.js';
import { ParticleField } from './particles.js';
import { Camera } from './camera.js';
import { drawHero } from './scenes/hero.js';
import { drawLine } from './scenes/line.js';
import { drawChant } from './scenes/chant.js';
import { drawBuild } from './scenes/build.js';
import { drawOutro } from './scenes/outro.js';
import { drawNarrative } from './scenes/narrative.js';
import { drawTypoSpectacle } from './scenes/typo-spectacle.js';
import { drawChorusEnergetic } from './scenes/chorus-energetic.js';
import { paperTear, iris, flashCut, TRANSITION_WINDOW } from './transitions.js';

const SCENE_RENDERERS = {
  hero: drawHero,
  line: drawLine,
  chant: drawChant,
  build: drawBuild,
  outro: drawOutro,
  narrative: drawNarrative,
  'typo-spectacle': drawTypoSpectacle,
  'chorus-energetic': drawChorusEnergetic
};

// Scènes qui gèrent elles-mêmes leur décor/caméra (composition riche) plutôt
// que le fond quadrillé générique + mascotte flottante par défaut.
const RICH_SCENES = new Set(['narrative', 'typo-spectacle', 'chorus-energetic']);

// Choix de transition selon le couple (scène sortante -> scène entrante).
function pickTransition(fromType, toType) {
  if (toType === 'chorus-energetic') return 'flash';
  if (fromType === 'chorus-energetic') return 'flash';
  if (toType === 'typo-spectacle' || fromType === 'typo-spectacle') return 'iris';
  return 'tear';
}

const ENERGY_BY_EMPHASIS = { low: 0.25, normal: 0.5, high: 1.0 };

export class ClaudePopEngine {
  constructor(canvas, { palette = PALETTE } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.palette = palette;
    this.mascot = new Bloom({ palette });
    this.companions = {
      spark: new Spark({ color: palette.accentC }),
      glow: new Glow({ color: palette.accentB })
    };
    this.particles = new ParticleField(36, palette);
    this.camera = new Camera();
    this.timeline = { sections: [] };
    this.lastFrameTime = null;

    this.clock = { getTime: () => 0 };
  }

  loadTimeline(timeline) {
    this.timeline = timeline;
    this.timeline.sections = [...timeline.sections].sort((a, b) => a.start - b.start);
  }

  setClock(getTime) {
    this.clock = { getTime };
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._w = rect.width;
    this._h = rect.height;
  }

  _cueAt(t) {
    return this.timeline.sections.find((s) => t >= s.start && t < s.end) || null;
  }

  _cueIndexAt(t) {
    return this.timeline.sections.findIndex((s) => t >= s.start && t < s.end);
  }

  _renderCueContent(ctx, w, h, cue, t) {
    const energy = cue ? ENERGY_BY_EMPHASIS[cue.emphasis] ?? 0.5 : 0.15;
    const rich = cue && RICH_SCENES.has(cue.type);

    if (!rich) {
      // Fond papier + grille générique, réservé aux scènes "simples" restantes.
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, this.palette.bgTop);
      grad.addColorStop(1, this.palette.bgBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      this._drawGrid(ctx, w, h);
      this.particles.draw(ctx, w, h, energy);
      const mascotVisible = cue ? cue.type !== 'hero' : true;
      if (mascotVisible) {
        const r = Math.min(w, h) * 0.09;
        this.mascot.draw(ctx, { x: w * 0.14, y: h * 0.18, radius: r, t, energy, pose: 'idle', expr: 'happy' });
      }
    }

    if (cue) {
      const renderer = SCENE_RENDERERS[cue.type] || drawLine;
      renderer(ctx, {
        w, h, cue,
        localT: t - cue.start,
        cueDuration: cue.end - cue.start,
        palette: this.palette,
        energy,
        t,
        camera: this.camera,
        mascot: this.mascot,
        companions: this.companions
      });
    }
  }

  renderFrame(t) {
    const ctx = this.ctx;
    const w = this._w || this.canvas.width;
    const h = this._h || this.canvas.height;
    const dt = this.lastFrameTime === null ? 0 : t - this.lastFrameTime;
    this.lastFrameTime = t;

    const idx = this._cueIndexAt(t);
    const cue = idx >= 0 ? this.timeline.sections[idx] : null;
    const energy = cue ? ENERGY_BY_EMPHASIS[cue.emphasis] ?? 0.5 : 0.15;
    this.particles.update(Math.max(0, dt), energy);

    // Détecte si on est dans la fenêtre de transition en fin de cue courante.
    const nextCue = idx >= 0 ? this.timeline.sections[idx + 1] : null;
    const timeToEnd = cue ? cue.end - t : Infinity;

    if (cue && nextCue && timeToEnd < TRANSITION_WINDOW && nextCue.start - cue.end < 0.05) {
      const progress = 1 - timeToEnd / TRANSITION_WINDOW;
      // Rendu de la scène sortante
      this._renderCueContent(ctx, w, h, cue, t);
      const kind = pickTransition(cue.type, nextCue.type);
      if (kind === 'tear') paperTear(ctx, w, h, progress, this.palette);
      else if (kind === 'iris') iris(ctx, w, h, progress, this.palette);
      else flashCut(ctx, w, h, progress);
    } else {
      this._renderCueContent(ctx, w, h, cue, t);
    }
  }

  _drawGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = this.palette.gridLine;
    ctx.lineWidth = 1;
    const step = Math.max(w, h) / 14;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
  }

  start() {
    const loop = () => {
      this.resize();
      this.renderFrame(this.clock.getTime());
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
  }
}
