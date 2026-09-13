import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  collect,
  pluginIdsFromInstallJson,
} from "./discover.mjs";

test("plugin ids drop marketplace suffix and dedupe", () => {
  const ids = pluginIdsFromInstallJson(
    JSON.stringify({
      plugins: {
        "superpowers@claude-plugins-official": [{}],
        "mattpocock-skills@mattpocock": [{}, {}],
        "swift-lsp@claude-plugins-official": [{}],
      },
    }),
  );
  assert.deepEqual(ids, ["mattpocock-skills", "superpowers", "swift-lsp"]);
});

test("collect lists skills, plugins, and apps from HOME", () => {
  const home = mkdtempSync(join(tmpdir(), "whoami-discover-"));
  const apps = join(home, "Applications");
  try {
    mkdirSync(join(home, ".claude", "skills", "graphify"), { recursive: true });
    mkdirSync(join(home, ".claude", "skills", "find-skills"), { recursive: true });
    mkdirSync(join(home, ".agents", "skills", "whoami"), { recursive: true });
    mkdirSync(join(home, ".claude", "plugins"), { recursive: true });
    writeFileSync(
      join(home, ".claude", "plugins", "installed_plugins.json"),
      JSON.stringify({
        plugins: {
          "superpowers@claude-plugins-official": [{}],
          "mattpocock-skills@mattpocock": [{}],
        },
      }),
    );
    mkdirSync(join(apps, "Arc.app"), { recursive: true });
    mkdirSync(join(apps, "Claude.app"), { recursive: true });
    mkdirSync(join(apps, "Orca.app"), { recursive: true });
    mkdirSync(join(apps, "Pen.app"), { recursive: true });

    const draft = collect({
      home,
      applications: apps,
      whichBin: () => false,
    });

    assert.deepEqual(draft.skills, ["find-skills", "graphify", "whoami"]);
    assert.deepEqual(draft.plugins, ["mattpocock-skills", "superpowers"]);
    assert.equal(draft.localProjects, undefined);
    assert.ok(draft.tools.some((item) => item.name === "Arc"));
    assert.ok(draft.tools.some((item) => item.name === "Claude Code"));
    assert.ok(!draft.tools.some((item) => item.name === "Claude"));
    assert.ok(draft.tools.some((item) => item.name === "Orca"));
    assert.ok(draft.tools.some((item) => item.name === "Pen"));
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
