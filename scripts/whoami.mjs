#!/usr/bin/env node
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const credDir = join(homedir(), ".whoami");
const credPath = join(credDir, "credentials.json");

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (part.startsWith("--")) {
      const key = part.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      args[key] = value;
    } else {
      args._.push(part);
    }
  }
  return args;
}

function loadCreds() {
  try {
    return JSON.parse(readFileSync(credPath, "utf8"));
  } catch {
    return {};
  }
}

function saveCreds(next) {
  mkdirSync(credDir, { recursive: true });
  writeFileSync(credPath, `${JSON.stringify(next, null, 2)}\n`);
  chmodSync(credPath, 0o600);
}

async function api(method, path, { apiBase, token, body }) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }
  return data;
}

function readProfile(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0];
const creds = loadCreds();
const apiBase = args.api || process.env.WHOAMI_API_BASE || creds.apiBase;

async function main() {
  if (command === "discover") {
    const { spawnSync } = await import("node:child_process");
    const script = new URL("./discover.mjs", import.meta.url);
    const result = spawnSync(process.execPath, [script.pathname], { stdio: "inherit" });
    process.exit(result.status ?? 1);
  }

  if (!apiBase) {
    throw new Error("Set --api or WHOAMI_API_BASE to the Convex .convex.site URL");
  }

  if (command === "publish") {
    const code = args.code;
    const profilePath = args.profile;
    if (!code || !profilePath) {
      throw new Error("Usage: whoami.mjs publish --code XXXX-XXXX --profile ./profile.json --api <url>");
    }
    const profile = readProfile(profilePath);
    const created = await api("POST", "/v1/profiles", {
      apiBase,
      body: { creationCode: code, profile },
    });
    saveCreds({
      apiBase,
      username: created.username,
      editToken: created.editToken,
    });
    process.stdout.write(`${JSON.stringify({ ok: true, url: created.url, username: created.username }, null, 2)}\n`);
    process.stdout.write(`Saved edit token to ${credPath}\n`);
    return;
  }

  if (command === "update") {
    const profilePath = args.profile;
    if (!profilePath) {
      throw new Error("Usage: whoami.mjs update --profile ./profile.json");
    }
    if (!creds.editToken || !creds.username) {
      throw new Error(`Missing ${credPath}. Publish a profile first.`);
    }
    const profile = readProfile(profilePath);
    const { username: _ignored, ...patch } = profile;
    const updated = await api("PATCH", `/v1/profiles/${creds.username}`, {
      apiBase: creds.apiBase || apiBase,
      token: creds.editToken,
      body: patch,
    });
    process.stdout.write(`${JSON.stringify(updated, null, 2)}\n`);
    return;
  }

  if (command === "me") {
    if (!creds.editToken) {
      throw new Error(`Missing ${credPath}. Publish a profile first.`);
    }
    const me = await api("GET", "/v1/me", {
      apiBase: creds.apiBase || apiBase,
      token: creds.editToken,
    });
    process.stdout.write(`${JSON.stringify(me, null, 2)}\n`);
    return;
  }

  throw new Error("Usage: whoami.mjs <discover|publish|update|me>");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
