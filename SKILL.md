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

Write the public profile as `sections` with headings the owner would actually use — "What I actually ship", "Tools I live in", "Currently chewing on", not frozen keys like `hiddenGems` / `exploring` / `howIWork`. Do not force the vocabulary Hidden gems / Currently exploring / Note. Discover output is raw observation; you choose the headings.

For each **named product, language, or tool** (not a freeform workflow phrase):

1. Keep `url` / `icon` if `discover.mjs` already set them.
2. Otherwise **search the web** for the official homepage. Prefer the vendor's own domain over directories, social posts, or random GitHub clones. A project's own GitHub org is fine when that is the homepage.
3. Set `url` to that `https://` page so the chip is clickable.
4. **Search for a small official icon** (favicon, Simple Icons, or an SVG/PNG on the vendor domain). Set `icon` to a direct `https://` image. If you omit `icon`, the site uses the favicon of `url`.
5. If you are not confident, **omit `url` and `icon`**. Never invent a link. Never use a search-results page, blog post, or affiliate copy.

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
- "Add an icon and link for Orca"
- "Set my avatar from ~/Pictures/me.jpg"

When adding or renaming a tool, web-search the official homepage and a small icon, then set `url` and `icon`. Rescan if useful, show a diff, then:

```bash
node scripts/whoami.mjs update --profile ./profile.json
```

### Avatar

Optional public photo. **JPEG, PNG, or WebP only** from a **local file the owner reviewed**. The API will not fetch a remote image URL (and you must not try). Never SVG or GIF.

Do not scrape `Pictures/`, `Downloads/`, screenshots, or random images. Discover may propose a face photo **only if the owner already pointed at that file** or it is clearly their portrait in the current conversation.

Photos from private folders need explicit user review of that exact path. This will be public. Standard EXIF/GPS is stripped when present; do not upload a photo they would not put on a public page.

```bash
node scripts/whoami.mjs avatar --file /absolute/or/relative/path.jpg
node scripts/whoami.mjs avatar --clear
```

## Privacy

Never publish:

- source code
- `.env` / API keys / passwords
- SSH keys
- raw shell history
- private documents
- photos the owner did not explicitly review for a public page

Username: `^[a-z][a-z0-9]{1,23}$`. Reserved: api, badge, create, explore, preview, skill, admin, www, whoami, settings, login, me, v1.

## Profile shape

Prefer custom section headings. A section is `{ "title", "items" }` and/or `{ "title", "body" }`. Title 1–40 chars, max 8 sections.

```json
{
  "username": "ivan",
  "displayName": "Ivan Matveev",
  "headline": "Backend Engineer × AI",
  "sections": [
    {
      "title": "What I actually ship",
      "items": [{ "name": "Pi Agent", "source": "self_reported", "url": "https://pi.dev" }]
    },
    {
      "title": "Tools I live in",
      "items": [{ "name": "Claude Code", "source": "observed", "url": "https://claude.com/product/claude-code" }]
    },
    {
      "title": "How I work",
      "items": [{ "name": "Multi-agent coding", "source": "inferred" }],
      "body": "I use Markdown tasks because agents can edit them."
    }
  ]
}
```

`source` is `observed` | `inferred` | `self_reported`. Optional `url` / `icon` are https official homepage and icon.

GET profile JSON may include `avatarUrl`. That field is **server-generated** (our origin). Never put a remote image URL into the profile. Never send `avatar` / `avatarUrl` on publish or update except to clear with the avatar command.

The older fields `tools`, `stack`, `workflows`, `hiddenGems`, `exploring`, and `howIWork` are still accepted. Do not write those keys for new profiles unless you also need them as a fallback.

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

### Design in Wonder, then upload

Optional custom look. There is no web dashboard and no Edit Profile — the local agent is the CMS.

1. Design the public page in Wonder. Keep it a public identity folio, not an app shell.
2. Recreate that design as a static directory (`index.html` plus CSS/assets). The page may fetch `/api/v1/profiles/{username}` for live JSON, with a local `profile.json` (or inlined fallback) so `/preview/{id}` still renders.
3. `node scripts/whoami.mjs site upload --dir ./site`
4. Open the returned `previewUrl` and poll `site status`. Do **not** run `site publish` unless the owner wants that preview to replace `/{username}`.
