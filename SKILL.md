---
name: whoami
description: Create and maintain a WhoAmI public profile from the user's local environment. Use when the user wants to create, publish, or update their WhoAmI page, scan their tools/stack, or change whoami.ai identity.
---

# WhoAmI Skill

Turn the user's existing agent into an identity agent.

Do not create a new agent. Do not invent a web dashboard. Publish only JSON the user has reviewed.

API base comes from the user's prompt (`API: https://….convex.site`), `WHOAMI_API_BASE`, or `~/.whoami/credentials.json`.

The landing "Copy prompt" only installs this skill and passes a creation code. **This file is the full instruction set.** Follow it.

## Flow

```text
DISCOVER → INTERPRET → INTERVIEW → REVIEW → PUBLISH → UPDATE
```

Discover proposes. Interview confirms. A clean machine should already contain almost everything that belongs on the page — you ask about what you found, you do not invent a second identity.

### 1. DISCOVER

Run `scripts/discover.mjs`. It lists apps, CLIs, agent skill folders, Claude plugins, and public GitHub repos (`gh`). It must not read `.env`, secrets, SSH keys, source code, or shell history. Do not scan a code folder like `~/Develop` — that layout is local, not portable.

Treat script output as **observed candidates**, not the public profile.

### 2. INTERPRET

Do not write slogans, catchphrases, or "clever" workflow names the owner never said.

Do not list both `Claude` and `Claude Code`. Prefer `Claude Code` when `.claude` or Claude.app is present.

Write the public profile as `sections` (max 8). Headings the owner would actually use. Discover is raw observation; you choose what to keep after interview.

For each **named product, language, or tool** (not a freeform sentence):

1. Keep `url` / `icon` if `discover.mjs` already set them.
2. Otherwise search the web for the official homepage. Prefer the vendor's own domain.
3. Set `url` to that `https://` page so the chip is clickable.
4. Set `icon` only if the URL **returns an image** (HTTP 200, `image/*`). Do not paste `cdn.simpleicons.org/{name}` without checking — some brands 404 (LinkedIn). If Simple Icons is a filled rounded square and the owner wants the letter mark, use the glyph without the square, or omit `icon` and let the site use the favicon of `url`.
5. If you are not confident, **omit `url` and `icon`**. Never invent a link.

### 3. INTERVIEW

Ask only against discover output. Show the lists. Typical round:

1. **Tools** — here is what I found on the machine. Which do you actually live in? Anything missing (browser, design tool, extra model provider)?
2. **Skills / plugins** — here are skill folders and plugins. Which do you **run**, not merely have installed? Drop leftovers (`find-skills`, one-off hooks, a whole vendor catalog you never invoke).
3. **Projects** — here are public GitHub repos. Which are **yours to advertise**? Ask for the canonical public URL (product site, Telegram bot, GitHub). Ask if they ship anything that is not on GitHub. Do not publish clones, stars, or someone else's repo. Look for a small local logo if they say yes.
4. **Identity** — one-line headline. Then 1–2 sentences: what they do **at work** vs **their own** apps / bots / services. Put that blurb as `body` on a `Find me` / `Links` / `Socials` section (the default page shows it under the name).
5. **How they run agents** — grounded in the tools you found (Claude Code, Codex, Orca, Pi, …). Order, subagents, harnesses. Use **their words**. How I work is **one `body`**. Extra `items` only if they add a new fact, not a restatement of the paragraph.
6. **Socials** — GitHub from discover. Ask LinkedIn / other profiles if missing.
7. **Exploring** — default a `body` paragraph, no chips, unless they name discrete things to chip.
8. **Hidden gems** — optional, only if they point at tools they love that are not already in Tools.

If they confirm a discovered item, keep `source: "observed"`. New facts they state: `source: "self_reported"`. Never mark inference as fact. Do not infer a How I work item like "Multi-agent coding".

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

If this profile is the site's classic landing example, keep `tools` / `stack` / `workflows` / `howIWork` in sync with the matching sections (the landing card still reads those fields). Otherwise `sections` is enough.

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

A section is `{ "title", "items" }` and/or `{ "title", "body" }`. Title 1–40 chars, max 8 sections. `body` 1–500 chars.

`Find me` / `Links` / `Socials` is lifted next to the name: `items` are social chips, `body` is the about blurb.

```json
{
  "username": "ivan",
  "displayName": "Ivan Matveev",
  "headline": "AI Engineer",
  "sections": [
    {
      "title": "How I work",
      "body": "Orca is the terminal and the control plane. I go Claude Code first, then Codex, then pi with z.ai (glm). I mostly work through subagents."
    },
    {
      "title": "Tools",
      "items": [
        { "name": "Claude Code", "source": "observed", "url": "https://claude.com/product/claude-code" }
      ]
    },
    {
      "title": "Skills I run",
      "items": [
        { "name": "Superpowers", "source": "self_reported", "url": "https://github.com/obra/superpowers" }
      ]
    },
    {
      "title": "Projects",
      "items": [
        { "name": "WhoAmI", "source": "self_reported", "url": "https://github.com/blackbalancef/whoami-skill" }
      ]
    },
    {
      "title": "Currently exploring",
      "body": "Looking for mix-and-match multi-agent work across providers and harnesses, not another control plane."
    },
    {
      "title": "Find me",
      "body": "At work I build a harness for an agent that helps teachers create learning courses. I also ship my own apps, Telegram bots, and services — listed below.",
      "items": [
        { "name": "GitHub", "source": "observed", "url": "https://github.com/blackbalancef" }
      ]
    }
  ]
}
```

Do not duplicate the How I work paragraph as chips underneath it.

`source` is `observed` | `inferred` | `self_reported`. Optional `url` / `icon` are https official homepage and icon.

GET profile JSON may include `avatarUrl`. That field is **server-generated** (our origin). Never put a remote image URL into the profile. Never send `avatar` / `avatarUrl` on publish or update except to clear with the avatar command.

The older fields `tools`, `stack`, `workflows`, `hiddenGems`, `exploring`, and `howIWork` are still accepted.

## Custom site

Optional. The default WhoAmI page stays until the owner publishes a built site.

`site init` downloads `GET {API}/v1/designs/classic` (the visual shell of the default page, no profile records) and writes live JSON from `GET /v1/me` into `#whoami-profile` plus `profile.json`. Customize those files, then upload. Data stays on the profile JSON endpoints; the zip is the look.

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
