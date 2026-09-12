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
  "tools": [{ "name": "Claude Code", "source": "observed" }],
  "stack": [{ "name": "Python", "source": "observed" }],
  "workflows": [{ "name": "Multi-agent coding", "source": "inferred" }],
  "hiddenGems": [{ "name": "Pi Agent", "source": "self_reported" }],
  "exploring": [{ "name": "Agent orchestration", "source": "self_reported" }],
  "howIWork": "I use Markdown tasks because agents can edit them."
}
```

`source` is `observed` | `inferred` | `self_reported`.
