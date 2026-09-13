#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
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
  "claude",
  "orca",
  "pi",
  "gh",
];

/** Claude.app is Claude Code — never emit a bare "Claude" chip. */
const APP_HINTS = {
  Claude: "Claude Code",
  Cursor: "Cursor",
  "Visual Studio Code": "VS Code",
  Zed: "Zed",
  Obsidian: "Obsidian",
  Raycast: "Raycast",
  Figma: "Figma",
  Docker: "Docker",
  Ghostty: "Ghostty",
  iTerm: "iTerm",
  Warp: "Warp",
  Linear: "Linear",
  Slack: "Slack",
  Notion: "Notion",
  Arc: "Arc",
  Orca: "Orca",
  Pen: "Pen",
};

export function which(bin) {
  try {
    execFileSync("which", [bin], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function gitName(home) {
  try {
    return execFileSync("git", ["config", "--global", "user.name"], {
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    }).trim();
  } catch {
    return "";
  }
}

export function pluginIdsFromInstallJson(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  const keys = Object.keys(data?.plugins ?? {});
  const names = keys.map((key) => key.split("@")[0]).filter(Boolean);
  return [...new Set(names)].sort();
}

export function listNamedDirs(dir, { skip = new Set(), limit = 48 } = {}) {
  if (!existsSync(dir)) return [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const names = [];
  for (const entry of entries) {
    if (entry.startsWith(".")) continue;
    if (skip.has(entry.toLowerCase())) continue;
    try {
      if (!statSync(join(dir, entry)).isDirectory()) continue;
    } catch {
      continue;
    }
    names.push(entry);
    if (names.length >= limit) break;
  }
  return names.sort();
}

function macApps(applications) {
  if (!existsSync(applications)) return [];
  const names = [];
  for (const entry of readdirSync(applications)) {
    if (!entry.endsWith(".app")) continue;
    const stem = entry.replace(/\.app$/, "");
    for (const [needle, label] of Object.entries(APP_HINTS)) {
      if (stem.includes(needle)) names.push(label);
    }
  }
  return [...new Set(names)];
}

function homeMarker(home, path, label) {
  return existsSync(join(home, path)) ? [label] : [];
}

function readGithub(home) {
  try {
    const raw = execFileSync(
      "gh",
      ["api", "user", "--jq", "{login:.login,url:.html_url,name:.name}"],
      {
        encoding: "utf8",
        timeout: 5000,
        stdio: ["ignore", "pipe", "ignore"],
        env: { ...process.env, HOME: home },
      },
    ).trim();
    const data = JSON.parse(raw);
    if (!data?.login) return undefined;
    return {
      login: data.login,
      url: data.url || `https://github.com/${data.login}`,
      name: data.name || undefined,
    };
  } catch {
    return undefined;
  }
}

function readPublicRepos(home, login) {
  if (!login) return [];
  try {
    const raw = execFileSync(
      "gh",
      [
        "repo",
        "list",
        login,
        "--limit",
        "30",
        "--visibility",
        "public",
        "--json",
        "name,url",
      ],
      {
        encoding: "utf8",
        timeout: 8000,
        stdio: ["ignore", "pipe", "ignore"],
        env: { ...process.env, HOME: home },
      },
    );
    const repos = JSON.parse(raw);
    if (!Array.isArray(repos)) return [];
    return repos
      .filter((repo) => repo?.name && repo?.url)
      .map((repo) => ({ name: repo.name, url: repo.url }));
  } catch {
    return [];
  }
}

function skillDirs(home) {
  const roots = [
    join(home, ".claude", "skills"),
    join(home, ".agents", "skills"),
    join(home, ".codex", "skills"),
  ];
  const names = [];
  for (const root of roots) {
    names.push(...listNamedDirs(root, { limit: 48 }));
  }
  return [...new Set(names)].sort();
}

function pluginNames(home) {
  const file = join(home, ".claude", "plugins", "installed_plugins.json");
  if (!existsSync(file)) return [];
  try {
    return pluginIdsFromInstallJson(readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

export function collect({
  home = process.env.HOME || homedir(),
  applications = process.platform === "darwin"
    ? "/Applications"
    : join(home, "Applications"),
  whichBin = which,
} = {}) {
  const tools = [
    ...macApps(applications),
    ...homeMarker(home, ".cursor", "Cursor"),
    ...homeMarker(home, ".claude", "Claude Code"),
    ...homeMarker(home, ".codex", "Codex"),
  ];
  if (whichBin("orca")) tools.push("Orca");
  if (whichBin("pi")) tools.push("Pi Agent");

  const stack = [];
  if (whichBin("python3") || whichBin("uv")) stack.push("Python");
  if (whichBin("node") || whichBin("bun")) stack.push("TypeScript");
  if (whichBin("swift")) stack.push("Swift");
  if (whichBin("rustc") || whichBin("cargo")) stack.push("Rust");
  if (whichBin("go")) stack.push("Go");
  if (whichBin("docker")) stack.push("Docker");
  if (whichBin("kubectl")) stack.push("Kubernetes");

  const github = readGithub(home);
  const displayName = gitName(home) || github?.name || undefined;

  return {
    displayName: displayName || undefined,
    github: github || undefined,
    tools: [...new Set(tools)].map((name) => withOfficialLink(name, "observed")),
    stack: [...new Set(stack)].map((name) => withOfficialLink(name, "observed")),
    observedClis: CLIS.filter((bin) => whichBin(bin)),
    skills: skillDirs(home),
    plugins: pluginNames(home),
    githubRepos: github ? readPublicRepos(home, github.login) : [],
  };
}

function isMain() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

if (isMain()) {
  process.stdout.write(`${JSON.stringify(collect(), null, 2)}\n`);
}
