// Utilitaires de typographie cinétique partagés par les scènes.

export function wrapLines(text) {
  return text.split('\n');
}

// Révèle les mots progressivement entre localT=0 (début de la réplique) et 1 (fin).
export function wordsRevealed(words, localT, revealWindow = 0.6) {
  const n = words.length;
  if (n === 0) return [];
  const progressed = Math.min(1, localT / revealWindow) * n;
  return words.map((w, i) => ({
    text: w,
    visible: i < progressed,
    justIn: i < progressed && i >= progressed - 1
  }));
}

export function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
