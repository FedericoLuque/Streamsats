import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHALLENGES_DIR = join(__dirname, "../challenges");

function readJSON(file) {
  return JSON.parse(readFileSync(join(CHALLENGES_DIR, file), "utf-8"));
}

let index = readJSON("index.json");
const cache = new Map();

function loadChallenge(name) {
  if (!cache.has(name)) {
    cache.set(name, readJSON(`${name}.json`));
  }
  return cache.get(name);
}

export function getCurrentChallenge() {
  const name = index.rotation[index.currentIndex];
  return loadChallenge(name);
}

export function advanceChallenge() {
  index.currentIndex = (index.currentIndex + 1) % index.rotation.length;
  return getCurrentChallenge();
}

export function getChallengeById(id) {
  for (const name of index.rotation) {
    const ch = loadChallenge(name);
    if (ch.id === id) return ch;
  }
  return null;
}
