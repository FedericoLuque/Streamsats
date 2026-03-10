/**
 * UI de pagos: QR del invoice, countdown, estados.
 */

export async function showInvoice({ invoice, paymentHash, amountSats, expiresAt }) {
  const section = document.getElementById("payment-section");
  if (!section) return;
  section.classList.add("active");

  document.getElementById("invoice-amount").textContent = `${amountSats} sats`;
  document.getElementById("invoice-text").textContent = invoice;

  // QR code via esm.sh
  const qrContainer = document.getElementById("qr-container");
  qrContainer.innerHTML = "";
  try {
    const QRCode = (await import("https://esm.sh/qrcode@1.5.3")).default;
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
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById("copy-invoice-btn");
      if (btn) {
        btn.textContent = "¡Copiado!";
        setTimeout(() => btn.textContent = "Copiar", 2000);
      }
    });
  }
}
