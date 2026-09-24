import { ClaudePopEngine } from './src/engine.js';

const canvas = document.getElementById('stage');
const audioEl = document.getElementById('audioEl');
const audioInput = document.getElementById('audioInput');
const lyricsInput = document.getElementById('lyricsInput');
const loadDemoBtn = document.getElementById('loadDemoBtn');
const playBtn = document.getElementById('playBtn');
const statusEl = document.getElementById('status');

const engine = new ClaudePopEngine(canvas);
engine.setClock(() => audioEl.currentTime);
engine.resize();
engine.start();

let hasAudio = false;
let hasLyrics = false;

function updatePlayable() {
  playBtn.disabled = !(hasAudio && hasLyrics);
}

audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  // Objet local uniquement (blob: URL en mémoire) — jamais uploadé.
  const url = URL.createObjectURL(file);
  audioEl.src = url;
  hasAudio = true;
  statusEl.textContent = `Audio local chargé : ${file.name}`;
  updatePlayable();
});

lyricsInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const timeline = JSON.parse(text);
    engine.loadTimeline(timeline);
    hasLyrics = true;
    statusEl.textContent = `Paroles chargées : ${file.name} (${timeline.sections.length} répliques)`;
  } catch (err) {
    statusEl.textContent = `Erreur JSON : ${err.message}`;
  }
  updatePlayable();
});

loadDemoBtn.addEventListener('click', async () => {
  const res = await fetch('data/demo-lyrics.json');
  const timeline = await res.json();
  engine.loadTimeline(timeline);
  hasLyrics = true;
  statusEl.textContent = `Démo chargée (texte de test, ${timeline.sections.length} répliques) — chargez un audio local pour lire.`;
  updatePlayable();
});

playBtn.addEventListener('click', () => {
  if (audioEl.paused) {
    audioEl.play();
    playBtn.textContent = 'Pause';
  } else {
    audioEl.pause();
    playBtn.textContent = 'Lecture';
  }
});

audioEl.addEventListener('ended', () => { playBtn.textContent = 'Lecture'; });

window.addEventListener('resize', () => engine.resize());

// Hook utilisé par le script de rendu headless (Playwright) : permet de
// piloter le temps manuellement, image par image, sans dépendre de la lecture
// temps réel de l'élément <audio>.
window.__claudePop = {
  engine,
  renderAt(t) {
    engine.renderFrame(t);
  }
};
