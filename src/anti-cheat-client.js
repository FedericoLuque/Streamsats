/**
 * Captura eventos de interacción del usuario y genera un interactionProof.
 */

let events = [];
let recording = false;

export function startRecording() {
  events = [];
  recording = true;
}

export function stopRecording() {
  recording = false;
}

export function recordEvent(type, x, y) {
  if (!recording) return;
  events.push({ type, x: Math.round(x), y: Math.round(y), timestamp: Date.now() });
}

export function generateProof() {
  return btoa(JSON.stringify(events));
}

export function getEventCount() {
  return events.length;
}
