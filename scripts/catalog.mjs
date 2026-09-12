/** Official homepages for tools discover already knows. Keys are lowercase. */
export const TOOL_LINKS = {
  aiogram: { url: "https://docs.aiogram.dev" },
  bun: { url: "https://bun.sh" },
  claude: { url: "https://claude.com" },
  "claude code": { url: "https://claude.com/product/claude-code" },
  codex: { url: "https://openai.com/codex/" },
  cursor: { url: "https://cursor.com" },
  docker: { url: "https://www.docker.com" },
  figma: { url: "https://www.figma.com" },
  ghostty: { url: "https://ghostty.org" },
  git: { url: "https://git-scm.com" },
  go: { url: "https://go.dev" },
  iterm: { url: "https://iterm2.com" },
  iterm2: { url: "https://iterm2.com" },
  kubernetes: { url: "https://kubernetes.io" },
  linear: { url: "https://linear.app" },
  neovim: { url: "https://neovim.io" },
  nvim: { url: "https://neovim.io" },
  node: { url: "https://nodejs.org" },
  notion: { url: "https://www.notion.so" },
  npm: { url: "https://www.npmjs.com" },
  obsidian: { url: "https://obsidian.md" },
  "pi agent": { url: "https://pi.dev" },
  pi: { url: "https://pi.dev" },
  pnpm: { url: "https://pnpm.io" },
  python: { url: "https://www.python.org" },
  raycast: { url: "https://www.raycast.com" },
  rust: { url: "https://www.rust-lang.org" },
  slack: { url: "https://slack.com" },
  swift: { url: "https://www.swift.org" },
  typescript: { url: "https://www.typescriptlang.org" },
  uv: { url: "https://docs.astral.sh/uv/" },
  "vs code": { url: "https://code.visualstudio.com" },
  vscode: { url: "https://code.visualstudio.com" },
  warp: { url: "https://www.warp.dev" },
  zed: { url: "https://zed.dev" },
};

export function withOfficialLink(name, source) {
  const known = TOOL_LINKS[name.trim().toLowerCase()];
  if (!known) return { name, source };
  return { name, source, url: known.url };
}
