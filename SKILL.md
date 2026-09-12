---
name: whoami
description: Create and maintain a WhoAmI public profile from the user's local environment. Use when the user wants to create, publish, or update their WhoAmI page, scan their tools/stack, or change whoami.ai identity.
---

# WhoAmI Skill

Turn the user's existing agent into an identity agent.

Do not create a new agent. Do not invent a web dashboard. Publish only JSON the user has reviewed.

API base comes from the user's prompt (`API: https://….convex.site`), `WHOAMI_API_BASE`, or `~/.whoami/credentials.json`.

## Flow

```text
DISCOVER → INTERPRET → INTERVIEW → REVIEW → PUBLISH → UPDATE
```

### 1. DISCOVER

Run `scripts/discover.mjs`. It inspects applications and common CLIs. It must not read `.env`, secrets, SSH keys, source code, or shell history.

Treat script output as **observed**.

### 2. INTERPRET

You may infer workflows (terminal-first, AI-heavy, markdown tasks). Mark those `source: "inferred"`. Never present inference as fact.

For each **named product, language, or tool** (not a freeform workflow phrase):

1. Keep `url` if `discover.mjs` already set one.
2. Otherwise **search the web** for the official homepage. Prefer the vendor's own domain over directories, social posts, or random GitHub clones. A project's own GitHub org is fine when that is the homepage.
3. Set `url` to that `https://` page.
4. Optionally set `icon` to a direct `https://` image (SVG/PNG from the official domain, or a Simple Icons CDN URL). If you omit `icon`, the site shows the favicon of `url`.
5. If you are not confident, **omit `url`**. Never invent a link. Never use a search-results page, blog post, or affiliate copy.

Workflows such as "Multi-agent coding" usually have no official site — leave them as name + source only.

### 3. INTERVIEW

Ask only what you could not learn. Typical:

1. What are you unusually good at?
2. What workflow would other people find useful?
3. What are you exploring right now?

Mark answers `source: "self_reported"`.

### 4. REVIEW

Show the exact public JSON. Say clearly: **this will be public**. Wait for approval.

### 5. PUBLISH

```bash
node scripts/whoami.mjs publish --code XXXX-XXXX --profile ./profile.json --api "$WHOAMI_API_BASE"
```

Store the returned `editToken` at `~/.whoami/credentials.json` (mode 0600). Tell the user their URL.

### 6. UPDATE

Later, the user talks to this agent:

- "I started using Ghostty"
- "Remove Docker"
- "Change my headline to …"

Rescan if useful, show a diff, then:

```bash
node scripts/whoami.mjs update --profile ./profile.json
```

## Privacy

Never publish:

- source code
- `.env` / API keys / passwords
- SSH keys
- raw shell history
- private documents

Username: `^[a-z][a-z0-9]{1,23}$`. Reserved: api, badge, create, explore, preview, skill, admin, www, whoami, settings, login, me, v1.

## Profile shape

```json
{
  "username": "ivan",
  "displayName": "Ivan Matveev",
  "headline": "Backend Engineer × AI",
  "tools": [{ "name": "Claude Code", "source": "observed", "url": "https://claude.com/product/claude-code" }],
  "stack": [{ "name": "Python", "source": "observed", "url": "https://www.python.org" }],
  "workflows": [{ "name": "Multi-agent coding", "source": "inferred" }],
  "hiddenGems": [{ "name": "Pi Agent", "source": "self_reported" }],
  "exploring": [{ "name": "Agent orchestration", "source": "self_reported" }],
  "howIWork": "I use Markdown tasks because agents can edit them."
}
```

`source` is `observed` | `inferred` | `self_reported`. Optional `url` / `icon` are https official homepage and icon.

## Custom site

Optional. The default WhoAmI page stays until the owner publishes a built site.

```bash
node scripts/whoami.mjs site init --dir ./site
node scripts/whoami.mjs site upload --dir ./site
node scripts/whoami.mjs site status
node scripts/whoami.mjs site publish
```

`upload` sends a zip. Static `index.html` (or a prebuilt `dist/` / `out/` / `build/`) is enough. If the zip has `package.json` and no root `index.html`, the platform builds it in a Daytona sandbox and then destroys the sandbox. Preview is `/preview/{id}`. `publish` replaces `/{username}` with that site. Viewing the profile does not start Daytona.

Do not upload `.env`, keys, `node_modules`, or source the user did not review.
