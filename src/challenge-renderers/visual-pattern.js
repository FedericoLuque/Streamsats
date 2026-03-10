/**
 * Renderer: visual-pattern (Simon Says)
 * Muestra la secuencia de colores brevemente, el jugador debe reproducirla clickeando en orden.
 */
import { recordEvent, startRecording, stopRecording } from "../anti-cheat-client.js";

const COLOR_MAP = {
  red:    { hex: "#ef4444", label: "Rojo" },
  blue:   { hex: "#3b82f6", label: "Azul" },
  green:  { hex: "#22c55e", label: "Verde" },
  yellow: { hex: "#eab308", label: "Amarillo" },
  purple: { hex: "#a855f7", label: "Violeta" },
};

export function renderVisualPattern(canvas, config, sessionToken, onAnswer) {
  const ctx = canvas.getContext("2d");
  const { sequence, colors } = config;
  const uniqueColors = colors || Object.keys(COLOR_MAP);

  // Layout: color buttons in a row at the bottom
  const BTN_R = 36;
  const btnY = canvas.height - 60;
  const totalW = uniqueColors.length * (BTN_R * 2 + 16) - 16;
  const startX = (canvas.width - totalW) / 2 + BTN_R;
  const buttons = uniqueColors.map((color, i) => ({
    color,
    x: startX + i * (BTN_R * 2 + 16),
    y: btnY,
  }));

  // State
  let phase = "watch";   // watch → input
  let showingIndex = -1; // which step is highlighted during playback
  let userInput = [];
  let flashTimer = null;

  startRecording();

  // --- Playback sequence ---
  function playSequence() {
    phase = "watch";
    userInput = [];
    let step = 0;

    function showStep() {
      showingIndex = step;
      setTimeout(() => {
        showingIndex = -1;
        step++;
        if (step < sequence.length) {
          setTimeout(showStep, 400);
        } else {
          setTimeout(() => { phase = "input"; }, 500);
        }
      }, 700);
    }

    setTimeout(showStep, 600);
  }

  // --- Draw loop ---
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    if (phase === "watch") {
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 15px monospace";
      ctx.fillText("MEMORIZÁ la secuencia...", canvas.width / 2, 30);
    } else {
      ctx.fillStyle = "#00ff9d";
      ctx.font = "bold 15px monospace";
      ctx.fillText(`Reproducí la secuencia — clickeá los colores en orden (${userInput.length}/${sequence.length})`, canvas.width / 2, 30);
    }

    // Sequence progress dots (top) — adapt size to sequence length
    const dotR = sequence.length > 6 ? 7 : 10;
    const dotSpacing = dotR * 2 + (sequence.length > 6 ? 8 : 8);
    const dotsStartX = canvas.width / 2 - (sequence.length - 1) * dotSpacing / 2;
    sequence.forEach((color, i) => {
      const x = dotsStartX + i * dotSpacing;
      const y = 55;
      ctx.beginPath();
      ctx.arc(x, y, dotR, 0, Math.PI * 2);

      if (phase === "watch" && i === showingIndex) {
        // Currently flashing
        ctx.fillStyle = COLOR_MAP[color]?.hex || "#fff";
        ctx.fill();
        ctx.shadowColor = COLOR_MAP[color]?.hex || "#fff";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (phase === "input" && i < userInput.length) {
        // Already entered
        const correct = userInput[i] === sequence[i];
        ctx.fillStyle = correct ? (COLOR_MAP[color]?.hex || "#fff") : "#ef4444";
        ctx.fill();
      } else {
        // Not yet shown/entered
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Color buttons
    buttons.forEach(({ color, x, y }) => {
      const isActive = phase === "watch" && color === sequence[showingIndex];
      const cfg = COLOR_MAP[color] || { hex: "#888", label: color };

      ctx.beginPath();
      ctx.arc(x, y, BTN_R, 0, Math.PI * 2);

      if (isActive) {
        ctx.fillStyle = cfg.hex;
        ctx.shadowColor = cfg.hex;
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = phase === "input" ? cfg.hex : cfg.hex + "55";
        ctx.fill();
        ctx.strokeStyle = cfg.hex;
        ctx.lineWidth = phase === "input" ? 3 : 1;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = phase === "input" ? "#fff" : "rgba(255,255,255,0.5)";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cfg.label, x, y);
    });

    // Replay button (bottom-right) during input phase
    if (phase === "input") {
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      roundRect(ctx, canvas.width - 110, canvas.height - 32, 100, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("▶ Ver de nuevo", canvas.width - 60, canvas.height - 20);
    }

    requestAnimationFrame(draw);
  }

  draw();
  playSequence();

  // --- Click handler ---
  canvas.style.cursor = "pointer";
  canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Replay button
    if (phase === "input" && mx > canvas.width - 110 && my > canvas.height - 32) {
      userInput = [];
      playSequence();
      return;
    }

    if (phase !== "input") return;

    // Check color buttons
    for (const btn of buttons) {
      const dist = Math.hypot(mx - btn.x, my - btn.y);
      if (dist <= BTN_R) {
        recordEvent("click", mx, my);
        userInput.push(btn.color);

        if (userInput.length === sequence.length) {
          stopRecording();
          canvas.onclick = null;
          setTimeout(() => onAnswer(userInput.join("-")), 400);
        }
        break;
      }
    }
  };

  return () => { canvas.onclick = null; stopRecording(); };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
