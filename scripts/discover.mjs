#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { withOfficialLink } from "./catalog.mjs";

const CLIS = [
  "git",
  "node",
  "npm",
  "pnpm",
  "bun",
  "python3",
  "uv",
  "rustc",
  "cargo",
  "go",
  "swift",
  "docker",
  "kubectl",
  "nvim",
  "code",
  "cursor",
  "zed",
];

const APP_HINTS = {
  "Claude": "Claude",
  "Cursor": "Cursor",
  "Visual Studio Code": "VS Code",
  "Zed": "Zed",
  "Obsidian": "Obsidian",
  "Raycast": "Raycast",
  "Figma": "Figma",
  "Docker": "Docker",
  "Ghostty": "Ghostty",
  "iTerm": "iTerm",
  "Warp": "Warp",
  "Linear": "Linear",
  "Slack": "Slack",
  "Notion": "Notion",
};

function which(bin) {
  try {
    execFileSync("which", [bin], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function gitName() {
  try {
    return execFileSync("git", ["config", "--global", "user.name"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

function macApps() {
  const dir = "/Applications";
  if (!existsSync(dir)) return [];
  const names = [];
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith(".app")) continue;
    const stem = entry.replace(/\.app$/, "");
    for (const [needle, label] of Object.entries(APP_HINTS)) {
      if (stem.includes(needle)) names.push(label);
    }
  }
  return [...new Set(names)];
}

function homeMarker(path, label) {
  return existsSync(join(homedir(), path)) ? [label] : [];
}

const tools = [
  ...macApps(),
  ...homeMarker(".cursor", "Cursor"),
  ...homeMarker(".claude", "Claude Code"),
  ...homeMarker(".codex", "Codex"),
];

const stack = [];
if (which("python3") || which("uv")) stack.push("Python");
if (which("node") || which("bun")) stack.push("TypeScript");
if (which("swift")) stack.push("Swift");
if (which("rustc") || which("cargo")) stack.push("Rust");
if (which("go")) stack.push("Go");
if (which("docker")) stack.push("Docker");
if (which("kubectl")) stack.push("Kubernetes");

const clis = CLIS.filter((bin) => which(bin));
const displayName = gitName();

const draft = {
  displayName: displayName || undefined,
  tools: [...new Set(tools)].map((name) => withOfficialLink(name, "observed")),
  stack: [...new Set(stack)].map((name) => withOfficialLink(name, "observed")),
  workflows: [],
  hiddenGems: [],
  exploring: [],
  observedClis: clis,
};

process.stdout.write(`${JSON.stringify(draft, null, 2)}\n`);
