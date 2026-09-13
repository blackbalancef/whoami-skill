import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const cli = fileURLToPath(new URL("./whoami.mjs", import.meta.url));

test("site init writes a static starter the upload command can zip", () => {
  const home = mkdtempSync(join(tmpdir(), "whoami-home-"));
  const dir = mkdtempSync(join(tmpdir(), "whoami-site-"));
  try {
    const result = spawnSync(process.execPath, [cli, "site", "init", "--dir", dir], {
      encoding: "utf8",
      env: { ...process.env, HOME: home, WHOAMI_API_BASE: "" },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Wrote stub site/);
    const html = readFileSync(join(dir, "index.html"), "utf8");
    assert.match(html, /<!doctype html>/i);
    assert.match(html, /profile\.json|\/api\/v1\/profiles\//);
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

test("site commands are documented on the CLI", () => {
  const result = spawnSync(process.execPath, [cli], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /site/);
});
