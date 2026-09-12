#!/usr/bin/env node
import {
  chmodSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
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

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function encodeZip(files) {
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.path, "utf8");
    const data = Buffer.from(file.data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    chunks.push(local, name, data);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(data.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(name.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, name);
    offset += 30 + name.length + data.length;
  }
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, centralBuf, end]);
}

const SKIP_NAMES = new Set(["node_modules", ".git", ".DS_Store", ".whoami"]);

function walkFiles(dir, base = "") {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name) || entry.name.startsWith(".env")) continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, rel));
    else out.push({ path: rel.replaceAll("\\", "/"), data: readFileSync(full) });
  }
  return out;
}

function zipDir(dir) {
  const files = walkFiles(dir);
  if (files.length === 0) {
    throw new Error(`No files to upload in ${dir}`);
  }
  const total = files.reduce((sum, file) => sum + file.data.length, 0);
  if (total > 4_500_000) {
    throw new Error("Site is larger than 4.5MB after skipping node_modules");
  }
  return encodeZip(files);
}

function starterHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WhoAmI</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; background: #f3eee4; color: #1c1814; font-family: ui-sans-serif, system-ui, sans-serif; }
      main { max-width: 40rem; margin: 0 auto; padding: 4rem 1.5rem; }
      h1 { font-size: 3rem; margin: 0 0 0.75rem; }
      p { color: #6f685e; line-height: 1.5; }
      a { color: inherit; }
    </style>
  </head>
  <body>
    <main>
      <p id="handle"></p>
      <h1 id="name">WhoAmI</h1>
      <p id="headline"></p>
    </main>
    <script>
      const parts = location.pathname.split("/").filter(Boolean);
      const username = parts[0] === "preview" ? null : parts[0];
      const src = username
        ? "/api/v1/profiles/" + username
        : "./profile.json";
      fetch(src).then((r) => r.json()).then((p) => {
        document.title = (p.displayName || "WhoAmI") + " · WhoAmI";
        document.getElementById("handle").textContent = "/" + (p.username || "");
        document.getElementById("name").textContent = p.displayName || "WhoAmI";
        document.getElementById("headline").textContent = p.headline || "";
      }).catch(() => {});
    </script>
  </body>
</html>
`;
}

async function requireCreds() {
  if (!creds.editToken) {
    throw new Error(`Missing ${credPath}. Publish a profile first.`);
  }
  return {
    apiBase: creds.apiBase || apiBase,
    token: creds.editToken,
  };
}

async function siteStatus(id) {
  const auth = await requireCreds();
  if (id) {
    return api("GET", `/v1/sites/${id}`, auth);
  }
  const data = await api("GET", "/v1/sites", auth);
  if (!data.latest) {
    throw new Error("No site upload yet. Run site upload first.");
  }
  return data.latest;
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

  if (command === "site" && args._[1] === "init") {
    const dir = args.dir || "./site";
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), starterHtml());
    if (creds.editToken && (creds.apiBase || apiBase)) {
      const me = await api("GET", "/v1/me", {
        apiBase: creds.apiBase || apiBase,
        token: creds.editToken,
      });
      writeFileSync(join(dir, "profile.json"), `${JSON.stringify(me, null, 2)}\n`);
    }
    process.stdout.write(`Wrote starter site to ${dir}\n`);
    return;
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

  if (command === "site") {
    const sub = args._[1];
    if (sub === "upload") {
      const dir = args.dir || "./site";
      if (!statSync(dir).isDirectory()) {
        throw new Error(`Usage: whoami.mjs site upload --dir ${dir}`);
      }
      const auth = await requireCreds();
      const zip = zipDir(dir);
      const response = await fetch(`${auth.apiBase}/v1/sites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/zip",
        },
        body: zip,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }
      saveCreds({ ...creds, apiBase: auth.apiBase, lastPreviewId: data.previewId });
      process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
      return;
    }
    if (sub === "status") {
      const status = await siteStatus(args.id || creds.lastPreviewId);
      process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
      return;
    }
    if (sub === "publish") {
      const auth = await requireCreds();
      const id = args.id || creds.lastPreviewId;
      if (!id) {
        throw new Error("Usage: whoami.mjs site publish --id <previewId>");
      }
      const published = await api("POST", `/v1/sites/${id}/publish`, auth);
      process.stdout.write(`${JSON.stringify(published, null, 2)}\n`);
      return;
    }
    throw new Error("Usage: whoami.mjs site <init|upload|status|publish>");
  }

  throw new Error("Usage: whoami.mjs <discover|publish|update|me|site>");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
