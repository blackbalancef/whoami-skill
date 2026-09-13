/** Official homepages for tools discover already knows. Keys are lowercase. */
const favicon = (host) =>
  `https://www.google.com/s2/favicons?domain=${host}&sz=64`;

export const TOOL_LINKS = {
  aiogram: { url: "https://docs.aiogram.dev", icon: favicon("docs.aiogram.dev") },
  arc: { url: "https://arc.net/", icon: "https://cdn.simpleicons.org/arc" },
  bun: { url: "https://bun.sh", icon: "https://cdn.simpleicons.org/bun" },
  claude: { url: "https://claude.com", icon: "https://cdn.simpleicons.org/claude" },
  "claude code": {
    url: "https://claude.com/product/claude-code",
    icon: "https://cdn.simpleicons.org/claude",
  },
  "claude design": {
    url: "https://claude.com/product/design",
    icon: "https://cdn.simpleicons.org/claude",
  },
  codex: {
    url: "https://openai.com/codex/",
    icon: "https://cdn.jsdelivr.net/gh/lobehub/lobe-icons@latest/packages/static-png/light/codex-color.png",
  },
  cursor: { url: "https://cursor.com", icon: "https://cdn.simpleicons.org/cursor" },
  docker: { url: "https://www.docker.com", icon: "https://cdn.simpleicons.org/docker" },
  figma: { url: "https://www.figma.com", icon: "https://cdn.simpleicons.org/figma" },
  ghostty: { url: "https://ghostty.org", icon: favicon("ghostty.org") },
  github: { url: "https://github.com", icon: "https://cdn.simpleicons.org/github" },
  git: { url: "https://git-scm.com", icon: "https://cdn.simpleicons.org/git" },
  go: { url: "https://go.dev", icon: "https://cdn.simpleicons.org/go" },
  iterm: { url: "https://iterm2.com", icon: "https://cdn.simpleicons.org/iterm2" },
  iterm2: { url: "https://iterm2.com", icon: "https://cdn.simpleicons.org/iterm2" },
  kubernetes: {
    url: "https://kubernetes.io",
    icon: "https://cdn.simpleicons.org/kubernetes",
  },
  langfuse: { url: "https://langfuse.com/", icon: favicon("langfuse.com") },
  linear: { url: "https://linear.app", icon: "https://cdn.simpleicons.org/linear" },
  neovim: { url: "https://neovim.io", icon: "https://cdn.simpleicons.org/neovim" },
  nvim: { url: "https://neovim.io", icon: "https://cdn.simpleicons.org/neovim" },
  node: { url: "https://nodejs.org", icon: "https://cdn.simpleicons.org/nodedotjs" },
  notion: { url: "https://www.notion.so", icon: "https://cdn.simpleicons.org/notion" },
  npm: { url: "https://www.npmjs.com", icon: "https://cdn.simpleicons.org/npm" },
  obsidian: { url: "https://obsidian.md", icon: "https://cdn.simpleicons.org/obsidian" },
  orca: { url: "https://www.onorca.dev/", icon: favicon("www.onorca.dev") },
  pen: { url: "https://www.pen.dev/", icon: "https://www.pen.dev/apple-touch-icon.png" },
  "pen.dev": { url: "https://www.pen.dev/", icon: "https://www.pen.dev/apple-touch-icon.png" },
  "pi agent": { url: "https://pi.dev", icon: favicon("pi.dev") },
  pi: { url: "https://pi.dev", icon: favicon("pi.dev") },
  pnpm: { url: "https://pnpm.io", icon: "https://cdn.simpleicons.org/pnpm" },
  python: { url: "https://www.python.org", icon: "https://cdn.simpleicons.org/python" },
  raycast: { url: "https://www.raycast.com", icon: "https://cdn.simpleicons.org/raycast" },
  rust: { url: "https://www.rust-lang.org", icon: "https://cdn.simpleicons.org/rust" },
  slack: { url: "https://slack.com", icon: "https://cdn.simpleicons.org/slack" },
  swift: { url: "https://www.swift.org", icon: "https://cdn.simpleicons.org/swift" },
  typescript: {
    url: "https://www.typescriptlang.org",
    icon: "https://cdn.simpleicons.org/typescript",
  },
  uv: { url: "https://docs.astral.sh/uv/", icon: favicon("docs.astral.sh") },
  "vs code": {
    url: "https://code.visualstudio.com",
    icon: "https://cdn.simpleicons.org/visualstudio",
  },
  vscode: {
    url: "https://code.visualstudio.com",
    icon: "https://cdn.simpleicons.org/visualstudio",
  },
  warp: { url: "https://www.warp.dev", icon: "https://cdn.simpleicons.org/warp" },
  "z.ai": { url: "https://z.ai", icon: favicon("z.ai") },
  zai: { url: "https://z.ai", icon: favicon("z.ai") },
  zed: { url: "https://zed.dev", icon: "https://cdn.simpleicons.org/zedindustries" },
};

export function withOfficialLink(name, source) {
  const known = TOOL_LINKS[name.trim().toLowerCase()];
  if (!known) return { name, source };
  return { name, source, url: known.url, icon: known.icon };
}
