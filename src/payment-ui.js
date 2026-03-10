/**
 * UI de pagos: QR del invoice, countdown, estados.
 */
import QRCode from "qrcode";

export async function showInvoice({ invoice, paymentHash, amountSats, expiresAt }) {
  const section = document.getElementById("payment-section");
  if (!section) return;
  section.classList.add("active");

  document.getElementById("invoice-amount").textContent = `${amountSats} sats`;
  document.getElementById("invoice-text").textContent = invoice;

  // QR code bundled
  const qrContainer = document.getElementById("qr-container");
  qrContainer.innerHTML = "";
  try {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, invoice.toUpperCase(), { width: 200, margin: 2, color: { dark: "#000", light: "#fff" } });
    qrContainer.appendChild(canvas);
  } catch {
    qrContainer.textContent = "(QR no disponible)";
  }

  // Invoice countdown
  const timerEl = document.getElementById("invoice-timer");
  const tick = () => {
    const remaining = Math.max(0, expiresAt - Date.now());
    const secs = Math.ceil(remaining / 1000);
    if (timerEl) timerEl.textContent = `Expira en ${secs}s`;
    if (remaining <= 0) clearInterval(timer);
  };
  tick();
  const timer = setInterval(tick, 1000);
}

export function hideInvoice() {
  const section = document.getElementById("payment-section");
  if (section) section.classList.remove("active");
}

export function copyInvoice() {
  const text = document.getElementById("invoice-text")?.textContent;
  if (!text) return;
  const btn = document.getElementById("copy-invoice-btn");
  const markCopied = () => {
    if (btn) {
      btn.textContent = "¡Copiado!";
      setTimeout(() => btn.textContent = "Copiar", 2000);
    }
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(markCopied).catch(() => {
      fallbackCopy(text);
      markCopied();
    });
  } else {
    fallbackCopy(text);
    markCopied();
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}
