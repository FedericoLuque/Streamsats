import { nwc } from "@getalby/sdk";
import dotenv from "dotenv";
dotenv.config();

let _client = null;

export function getNWCClient() {
  if (!_client) {
    const url = process.env.NWC_URL;
    if (!url || url === "nostr+walletconnect://...") {
      console.warn("⚠️  NWC_URL no configurada — modo mock activado");
      return null;
    }
    _client = new nwc.NWCClient({ nostrWalletConnectUrl: url });
    console.log("⚡ NWC client creado");
  }
  return _client;
}

export async function testNWCConnection() {
  const client = getNWCClient();
  if (!client) return { ok: false, reason: "no NWC_URL configured" };
  try {
    const info = await client.getInfo();
    return { ok: true, alias: info.alias, pubkey: info.pubkey };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}
